package org.example.service;

import org.example.dto.NewsItemDTO;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.locks.ReentrantReadWriteLock;

@Service
public class NewsService {

    private static final int MAX_NEWS_ITEMS = 10;
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    private final NewsApiClient newsApiClient;
    private final GeminiApiClient geminiApiClient;
    
    private final List<NewsItemDTO> newsCache = new ArrayList<>();
    private final ReentrantReadWriteLock cacheLock = new ReentrantReadWriteLock();

    public NewsService(NewsApiClient newsApiClient, GeminiApiClient geminiApiClient) {
        this.newsApiClient = newsApiClient;
        this.geminiApiClient = geminiApiClient;
    }

    public List<NewsItemDTO> getLatestNews() {
        cacheLock.readLock().lock();
        try {
            return new ArrayList<>(newsCache);
        } finally {
            cacheLock.readLock().unlock();
        }
    }

    public void refreshNews() {
        new Thread(() -> {
            try {
                List<NewsApiClient.RawNewsItem> rawNews = newsApiClient.getLatestCryptoNews(15);
                
                if (rawNews.isEmpty()) {
                    System.out.println("No news fetched from News API");
                    return;
                }

                List<NewsItemDTO> processedNews = new ArrayList<>();
                
                for (int i = 0; i < Math.min(rawNews.size(), MAX_NEWS_ITEMS); i++) {
                    NewsApiClient.RawNewsItem raw = rawNews.get(i);
                    
                    String summary = geminiApiClient.summarizeNews(raw.title, raw.description);
                    
                    NewsItemDTO newsItem = NewsItemDTO.builder()
                            .id(UUID.randomUUID().toString())
                            .title(raw.title)
                            .summary(summary)
                            .source(raw.source)
                            .url(raw.url)
                            .imageUrl(raw.imageUrl)
                            .publishedAt(parsePublishedAt(raw.publishedAt))
                            .tags(extractTags(raw.title + " " + raw.description))
                            .build();
                    
                    processedNews.add(newsItem);
                }

                cacheLock.writeLock().lock();
                try {
                    newsCache.clear();
                    newsCache.addAll(processedNews);
                    System.out.println("News cache updated with " + processedNews.size() + " items");
                } finally {
                    cacheLock.writeLock().unlock();
                }
            } catch (Exception e) {
                System.err.println("Error refreshing news: " + e.getMessage());
                e.printStackTrace();
            }
        }).start();
    }

    private LocalDateTime parsePublishedAt(String dateString) {
        try {
            return LocalDateTime.parse(dateString.replace("Z", "+00:00"));
        } catch (Exception e) {
            return LocalDateTime.now();
        }
    }

    private List<String> extractTags(String text) {
        List<String> tags = new ArrayList<>();
        String lower = text.toLowerCase();
        
        if (lower.contains("bitcoin") || lower.contains("btc")) tags.add("BTC");
        if (lower.contains("ethereum") || lower.contains("eth")) tags.add("ETH");
        if (lower.contains("market")) tags.add("Market");
        if (lower.contains("defi")) tags.add("DeFi");
        if (lower.contains("nft")) tags.add("NFT");
        if (lower.contains("regulation") || lower.contains("regulatory")) tags.add("Regulation");
        
        if (tags.isEmpty()) tags.add("Crypto");
        
        return tags;
    }
}
