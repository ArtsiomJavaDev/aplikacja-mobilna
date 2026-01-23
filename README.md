# ProjectAPI1.1 - Platforma wymiany kryptowalut i walut

## Temat projektu
Webowa aplikacja do wymiany kryptowalut i walut tradycyjnych z interfejsem użytkownika i dostępem do bazy danych PostgreSQL. Aplikacja umożliwia użytkownikom przeglądanie kursów kryptowalut i walut, składanie zamówień oraz zarządzanie kontem. Panel administracyjny pozwala na zarządzanie zamówieniami i użytkownikami.

## Autorzy projektu
- **Imię Nazwisko** - Numer indeksu: [DO UZUPEŁNIENIA]
- **Imię Nazwisko** - Numer indeksu: [DO UZUPEŁNIENIA]

## Architektura projektu

Aplikacja składa się z trzech głównych komponentów:
- **Backend** - Spring Boot 3.2.0 (Java 21) z REST API
- **Frontend** - React 18 z TypeScript i Material-UI
- **Baza danych** - PostgreSQL 16

## Funkcjonalności

### 1. Zarządzanie użytkownikami (CRUD)
- Rejestracja nowych użytkowników (`POST /api/auth/signup`)
- Logowanie użytkowników (`POST /api/auth/signin`)
- Sprawdzanie statusu autoryzacji (`GET /api/auth/check`)
- System ról (USER, ADMIN)
- Hasła są szyfrowane przy użyciu BCrypt

### 2. Zarządzanie zamówieniami (CRUD)
- Tworzenie zamówień przez zalogowanych użytkowników (`POST /api/orders`)
- Przeglądanie własnych zamówień (`GET /api/orders/my`)
- Przeglądanie wszystkich zamówień przez administratora (`GET /api/orders`)
- Aktualizacja statusu zamówienia przez administratora (`PUT /api/orders/{orderId}/status`)
- Statusy zamówień: PENDING, CONFIRMED, COMPLETED, CANCELLED

### 3. Przeglądanie kryptowalut
- Lista dostępnych kryptowalut (`GET /api/crypto`)
- Pobieranie ceny konkretnej kryptowaluty (`GET /api/crypto/{symbol}/price`)
- Integracja z CoinMarketCap API
- Obsługiwane kryptowaluty: BTC, ETH, BNB, ADA, SOL, DOT, LINK, LTC
- Automatyczne obliczanie ceny sprzedaży z rabatem

### 4. Przeglądanie kursów walut
- Lista dostępnych walut (`GET /api/currencies`)
- Pobieranie kursów z CurrencyFreaks API
- Obsługiwane waluty: USD, EUR, GBP (wszystkie względem PLN)
- Obliczanie kursów z marżą (`GET /api/currencies/rate`)

### 5. Panel administracyjny
- Endpoint testowy (`GET /api/admin/test`)
- Przeglądanie wszystkich aktywnych zamówień (`GET /api/admin/orders`)
- Wymaga roli ADMIN

## Wymagania systemowe

- Docker 20.10+
- Docker Compose 2.0+
- Minimum 4GB RAM
- Połączenie z internetem (dla zewnętrznych API)

## Instalacja i uruchomienie

### Szybkie uruchomienie

Aplikacja została przygotowana do uruchomienia za pomocą jednej komendy:

```bash
docker compose up
```

Ta komenda:
1. Pobierze obrazy Docker (PostgreSQL, nginx)
2. Zbuduje obrazy dla backendu i frontendu
3. Uruchomi wszystkie kontenery w odpowiedniej kolejności
4. Zainicjalizuje bazę danych z migracjami Flyway
5. Uruchomi aplikację backendową na porcie 8081
6. Uruchomi aplikację frontendową na porcie 80

### Dodatkowe kroki (jeśli potrzebne)

#### 1. Sprawdzenie działania aplikacji

Po uruchomieniu `docker compose up`, aplikacja będzie dostępna pod adresami:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8081
- **Baza danych**: localhost:5432

#### 2. Sprawdzenie statusu kontenerów

```bash
docker compose ps
```

Wszystkie kontenery powinny mieć status "Up" i być zdrowe (healthcheck).

#### 3. Logi aplikacji

Aby zobaczyć logi wszystkich serwisów:
```bash
docker compose logs -f
```

Logi konkretnego serwisu:
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

#### 4. Zatrzymanie aplikacji

```bash
docker compose down
```

Aby również usunąć wolumeny (w tym dane z bazy danych):
```bash
docker compose down -v
```

#### 5. Przebudowa aplikacji po zmianach w kodzie

```bash
docker compose up --build
```

#### 6. Uruchomienie w tle (detached mode)

```bash
docker compose up -d
```

## Struktura projektu

```
ProjectAPI1.1/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/org/example/
│   │   │   │   ├── controller/     # Kontrolery REST API
│   │   │   │   ├── service/         # Logika biznesowa
│   │   │   │   ├── entity/          # Encje JPA
│   │   │   │   ├── repository/      # Repozytoria danych
│   │   │   │   ├── security/        # Konfiguracja bezpieczeństwa
│   │   │   │   └── dto/             # Obiekty transferu danych
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── db/migration/    # Migracje Flyway
│   │   └── test/
│   ├── build.gradle
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/              # Komponenty React
│   │   ├── store/                    # Redux store
│   │   ├── api/                      # Konfiguracja axios
│   │   └── App.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## Konfiguracja

### Zmienne środowiskowe

Aplikacja używa następujących zmiennych środowiskowych (ustawione w `docker-compose.yml`):

**Backend:**
- `SPRING_DATASOURCE_URL` - URL bazy danych
- `SPRING_DATASOURCE_USERNAME` - Użytkownik bazy danych
- `SPRING_DATASOURCE_PASSWORD` - Hasło bazy danych
- `JWT_SECRET` - Sekretny klucz JWT
- `JWT_EXPIRATION` - Czas wygaśnięcia tokenu (w milisekundach)
- `CURRENCYFREAKS_APIKEY` - Klucz API CurrencyFreaks (opcjonalny, bez niego używane są dane statyczne)
- `COINMARKETCAP_API_KEY` - Klucz API CoinMarketCap (opcjonalny, bez niego używane są dane statyczne)
- `CRYPTO_SELL_DISCOUNT_PERCENT` - Procent rabatu przy sprzedaży kryptowalut

### Porty

- **Frontend**: 80 (nginx)
- **Backend**: 8081
- **PostgreSQL**: 5432

## Testowanie aplikacji

### 1. Rejestracja użytkownika

```bash
curl -X POST http://localhost:8081/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Logowanie

```bash
curl -X POST http://localhost:8081/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Odpowiedź zawiera token JWT, który należy używać w nagłówku `Authorization: Bearer <token>`.

### 3. Pobranie listy kryptowalut

```bash
curl -X GET http://localhost:8081/api/crypto \
  -H "Authorization: Bearer <token>"
```

### 4. Utworzenie zamówienia

```bash
curl -X POST http://localhost:8081/api/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currencyCode": "BTC",
    "amount": 0.1
  }'
```

## Rozwiązywanie problemów

### Problem: Kontenery nie uruchamiają się

**Rozwiązanie:**
1. Sprawdź, czy porty 80, 8081 i 5432 są wolne:
   ```bash
   netstat -an | grep -E ":(80|8081|5432)"
   ```
2. Zatrzymaj inne aplikacje używające tych portów
3. Uruchom ponownie: `docker compose down && docker compose up`

### Problem: Backend nie może połączyć się z bazą danych

**Rozwiązanie:**
1. Sprawdź logi postgres: `docker compose logs postgres`
2. Upewnij się, że kontener postgres jest w stanie "healthy"
3. Sprawdź zmienne środowiskowe w `docker-compose.yml`

### Problem: Frontend nie łączy się z backendem

**Rozwiązanie:**
1. Sprawdź konfigurację nginx w `frontend/nginx.conf`
2. Upewnij się, że backend jest dostępny pod nazwą `backend` w sieci Docker
3. Sprawdź logi frontendu: `docker compose logs frontend`

### Problem: Migracje Flyway nie działają

**Rozwiązanie:**
1. Sprawdź logi backendu: `docker compose logs backend`
2. Upewnij się, że pliki migracji są w `backend/src/main/resources/db/migration/`
3. Sprawdź konfigurację Flyway w `application.properties`

## Technologie użyte w projekcie

### Backend
- Spring Boot 3.2.0
- Spring Security z JWT
- Spring Data JPA
- PostgreSQL Driver
- Flyway (migracje bazy danych)
- Lombok
- Jackson (JSON)

### Frontend
- React 18
- TypeScript
- Material-UI (MUI)
- Redux Toolkit
- React Router
- Axios
- Vite

### Infrastruktura
- Docker & Docker Compose
- PostgreSQL 16
- Nginx
- Gradle (backend)
- npm (frontend)

## Licencja

Projekt został stworzony w celach edukacyjnych.

## Kontakt

W przypadku pytań lub problemów, proszę o kontakt przez repozytorium projektu.
