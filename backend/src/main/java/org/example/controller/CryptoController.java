package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/crypto")
@RequiredArgsConstructor
public class CryptoController {
    private static final Logger logger = LoggerFactory.getLogger(CryptoController.class);
    
    @Value("${coinmarketcap.api.url}")
    private String coinMarketCapApiUrl;
    
    @Value("${coinmarketcap.api.key}")
    private String coinMarketCapApiKey;
    
    @Value("${crypto.sell.discount.percent}")
    private double sellDiscountPercent;

    // List of supported cryptocurrencies for trading
    private static final List<CryptoInfo> SUPPORTED_CRYPTOS = List.of(
        new CryptoInfo("bitcoin", "BTC", "Bitcoin"),
        new CryptoInfo("ethereum", "ETH", "Ethereum"),
        new CryptoInfo("binancecoin", "BNB", "Binance Coin"),
        new CryptoInfo("cardano", "ADA", "Cardano"),
        new CryptoInfo("solana", "SOL", "Solana"),
        new CryptoInfo("polkadot", "DOT", "Polkadot"),
        new CryptoInfo("chainlink", "LINK", "Chainlink"),
        new CryptoInfo("litecoin", "LTC", "Litecoin")
    );

    @GetMapping
    public ResponseEntity<List<CryptoResponse>> getAllCryptos() {
        logger.info("Fetching cryptocurrency prices from CoinMarketCap API");
        List<CryptoResponse> cryptos = new ArrayList<>();
        
        try {
            // Create headers with API key
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-CMC_PRO_API_KEY", coinMarketCapApiKey);
            headers.set("Accept", "application/json");
            
            // Create HTTP entity with headers
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            // Build URL with parameters
            String url = coinMarketCapApiUrl + "/cryptocurrency/listings/latest?start=1&limit=100&convert=USD";
            
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                String.class
            );
            
            logger.debug("CoinMarketCap response: {}", response.getBody());
            
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());
            
            if (!root.has("data")) {
                logger.error("CoinMarketCap response does not contain data");
                return getStaticCryptos();
            }
            
            JsonNode data = root.get("data");
            
            for (CryptoInfo cryptoInfo : SUPPORTED_CRYPTOS) {
                CryptoResponse crypto = findCryptoInResponse(data, cryptoInfo);
                if (crypto != null) {
                    cryptos.add(crypto);
                } else {
                    logger.warn("Could not find {} in API response, using static data", cryptoInfo.getSymbol());
                    cryptos.add(new CryptoResponse(
                        cryptoInfo.getId(),
                        cryptoInfo.getSymbol(),
                        cryptoInfo.getName(),
                        getDefaultPrice(cryptoInfo.getSymbol()),
                        calculateSellPrice(getDefaultPrice(cryptoInfo.getSymbol()))
                    ));
                }
            }
        } catch (Exception e) {
            logger.error("Error fetching from CoinMarketCap: {}", e.getMessage());
            return getStaticCryptos();
        }
        
        logger.info("Returning {} cryptocurrencies", cryptos.size());
        return ResponseEntity.ok(cryptos);
    }

    @GetMapping("/{symbol}/price")
    public ResponseEntity<CryptoPriceResponse> getCryptoPrice(@PathVariable String symbol) {
        logger.info("Fetching price for cryptocurrency: {}", symbol);
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-CMC_PRO_API_KEY", coinMarketCapApiKey);
            headers.set("Accept", "application/json");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            String url = coinMarketCapApiUrl + "/cryptocurrency/quotes/latest?symbol=" + symbol.toUpperCase() + "&convert=USD";
            
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                String.class
            );
            
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());
            
            if (!root.has("data") || root.get("data").size() == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
            
            JsonNode data = root.get("data").get(symbol.toUpperCase());
            double marketPrice = data.get("quote").get("USD").get("price").asDouble();
            double sellPrice = calculateSellPrice(marketPrice);
            
            CryptoPriceResponse priceResponse = new CryptoPriceResponse(
                symbol.toUpperCase(),
                marketPrice,
                sellPrice,
                sellDiscountPercent
            );
            
            return ResponseEntity.ok(priceResponse);
        } catch (Exception e) {
            logger.error("Error fetching cryptocurrency price: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(null);
        }
    }

    private CryptoResponse findCryptoInResponse(JsonNode data, CryptoInfo cryptoInfo) {
        for (JsonNode item : data) {
            if (item.has("symbol") && cryptoInfo.getSymbol().equalsIgnoreCase(item.get("symbol").asText())) {
                try {
                    double marketPrice = item.get("quote").get("USD").get("price").asDouble();
                    double sellPrice = calculateSellPrice(marketPrice);
                    
                    return new CryptoResponse(
                        cryptoInfo.getId(),
                        cryptoInfo.getSymbol(),
                        cryptoInfo.getName(),
                        marketPrice,
                        sellPrice
                    );
                } catch (Exception e) {
                    logger.warn("Error parsing crypto data for {}: {}", cryptoInfo.getSymbol(), e.getMessage());
                    return null;
                }
            }
        }
        return null;
    }

    private double calculateSellPrice(double marketPrice) {
        return marketPrice * (1 - sellDiscountPercent / 100.0);
    }

    private ResponseEntity<List<CryptoResponse>> getStaticCryptos() {
        logger.warn("Using static cryptocurrency data as fallback");
        List<CryptoResponse> cryptos = new ArrayList<>();
        for (CryptoInfo cryptoInfo : SUPPORTED_CRYPTOS) {
            double marketPrice = getDefaultPrice(cryptoInfo.getSymbol());
            cryptos.add(new CryptoResponse(
                cryptoInfo.getId(),
                cryptoInfo.getSymbol(),
                cryptoInfo.getName(),
                marketPrice,
                calculateSellPrice(marketPrice)
            ));
        }
        return ResponseEntity.ok(cryptos);
    }
    
    private double getDefaultPrice(String symbol) {
        // These prices will only be used if the API fails
        switch (symbol) {
            case "BTC": return 43000.0;
            case "ETH": return 2600.0;
            case "BNB": return 310.0;
            case "ADA": return 0.48;
            case "SOL": return 105.0;
            case "DOT": return 7.2;
            case "LINK": return 14.5;
            case "LTC": return 73.0;
            default: return 100.0;
        }
    }

    // DTO Classes
    static class CryptoInfo {
        private String id;
        private String symbol;
        private String name;

        public CryptoInfo(String id, String symbol, String name) {
            this.id = id;
            this.symbol = symbol;
            this.name = name;
        }

        public String getId() { return id; }
        public String getSymbol() { return symbol; }
        public String getName() { return name; }
    }

    static class CryptoResponse {
        private String id;
        private String symbol;
        private String name;
        private double marketPrice;
        private double sellPrice;

        public CryptoResponse(String id, String symbol, String name, double marketPrice, double sellPrice) {
            this.id = id;
            this.symbol = symbol;
            this.name = name;
            this.marketPrice = marketPrice;
            this.sellPrice = sellPrice;
        }

        public String getId() { return id; }
        public String getSymbol() { return symbol; }
        public String getName() { return name; }
        public double getMarketPrice() { return marketPrice; }
        public double getSellPrice() { return sellPrice; }
    }

    static class CryptoPriceResponse {
        private String symbol;
        private double marketPrice;
        private double sellPrice;
        private double discountPercent;

        public CryptoPriceResponse(String symbol, double marketPrice, double sellPrice, double discountPercent) {
            this.symbol = symbol;
            this.marketPrice = marketPrice;
            this.sellPrice = sellPrice;
            this.discountPercent = discountPercent;
        }

        public String getSymbol() { return symbol; }
        public double getMarketPrice() { return marketPrice; }
        public double getSellPrice() { return sellPrice; }
        public double getDiscountPercent() { return discountPercent; }
    }
} 