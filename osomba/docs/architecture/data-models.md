# Osomba Marketplace: Data Models & Schemas

This document provides a comprehensive technical reference for the Osomba Marketplace data architecture, mapping **Database Models** (SQLAlchemy) to their corresponding **API Schemas** (Pydantic).

---

## 1. User Domain

### 1.1 Database Model (`User`)
*Location: `backend/app/models/user.py`*

| Column | Type | Description |
| :--- | :--- | :--- |
| **`user_id`** | Integer | Unique identifier for the user (Primary Key). |
| **`user_name`** | String | The user's chosen public username (unique, nullable). |
| **`phone_number`** | String | The user's phone number (unique, nullable). |
| **`email`** | String | The user's email address, used for login and communication (unique). |
| **`cognito_sub`** | String | Unique identifier from AWS Cognito, linking the local record to the auth provider (unique, nullable). |
| **`is_onboarded`** | Boolean | A flag indicating whether the user has completed the initial profile setup. |
| **`full_name`** | String | The user's full legal name (nullable). |
| **`address`** | String | The user's physical address (nullable). |
| **`city`** | String | The city part of the user's address (nullable). |
| **`country`** | String | The country part of the user's address (nullable). |
| **`bio`** | String | A short biography or description for the user's profile (nullable). |
| **`twofa_enabled`** | Boolean | A flag indicating if the user has enabled two-factor authentication. |
| **`twofa_secret_key`** | String | The secret key used for generating 2FA codes, if enabled (nullable). |
| **`role`** | Enum | The role of the user, which controls their permissions (e.g., 'BUYER', 'SELLER', 'BOTH', 'admin'). |
| **`accepted_terms_at`** | DateTime | The timestamp when the user last accepted the terms of service. |
| **`terms_version`** | String | The version of the terms of service that the user accepted. |
| **`marketing_opt_in`** | Boolean | A flag indicating whether the user has agreed to receive marketing communications. |
| **`created_at`** | DateTime | The timestamp when the user account was created. |

### 1.2 API Schemas
*Location: `backend/app/schemas/user.py`*

- **`UserBase`**: Base schema for user profile data. Includes `email` (EmailStr), `full_name`, `user_name`, `phone_number`, `address`, `city`, `country`, `bio`, `role` (UserRole), and `is_onboarded`.
- **`UserJitCreate`**: Schema for Just-In-Time user creation. Includes `terms_version` (str) and `marketing_opt_in` (bool).
- **`UserOnboard`**: Fields required to complete a user's profile: `full_name`, `user_name`, `address`, `city`, `country`, `role` (UserRole). Optional: `phone_number`, `bio`.
- **`UserUpdate`**: Schema for updating a user's profile. All fields from `UserBase` are optional.
- **`UserResponse`**: Full user object returned by the API. Includes all `UserBase` fields plus `user_id`, `created_at`, `accepted_terms_at`, `terms_version`, and `marketing_opt_in`.

---

## 2. Product Domain

### 2.1 Database Model (`Product`)
*Location: `backend/app/models/product.py`*

| Column | Type | Description |
| :--- | :--- | :--- |
| **`product_id`** | Integer | Unique identifier for the product (Primary Key). |
| **`seller_id`** | Integer | Links to the `User` who is selling the product (Foreign Key to `users.user_id`). |
| **`title`** | String | The name or title of the product. |
| **`description`** | String | A detailed description of the product (nullable). |
| **`images`** | String | URLs for product images, typically as a JSON string or comma-separated list (nullable). |
| **`quantity`** | Integer | The number of units of this product currently in stock. |
| **`price`** | Numeric | The price for a single unit of the product for "Buy it now" listings. |
| **`end_time`** | DateTime | For auction-style listings, this is when the auction ends (nullable). |
| **`product_listing_type`** | String | The type of listing: 'Buy it now', 'Auction', or 'Both'. |

### 2.2 API Schemas
*Location: `backend/app/schemas/product.py`*

- **`ProductBase`**: Includes `title`, `description`, `images`, `quantity`, `price`, `end_time`, and `product_listing_type`.
- **`ProductCreate`**: Schema used for creating a new product (inherits from `ProductBase`).
- **`ProductUpdate`**: All fields from `ProductBase` are optional.
- **`Product`**: Full schema for API responses. Includes `product_id` and `seller_id`.

---

## 3. Auction Domain

### 3.1 Database Models
*Location: `backend/app/models/auction.py`*

#### `Auction`
| Column | Type | Description |
| :--- | :--- | :--- |
| **`auction_id`** | Integer | Unique identifier for the auction (Primary Key). |
| **`product_id`** | Integer | The product being auctioned (Foreign Key to `product.product_id`). |
| **`seller_id`** | Integer | The user who is selling the item (Foreign Key to `users.user_id`). |
| **`winning_buyer_id`** | Integer | The user with the current winning bid; becomes final winner if successful (Foreign Key to `users.user_id`, nullable). |
| **`starting_bid`** | Numeric | The initial price at which bidding starts. |
| **`current_highest_bid`** | Numeric | The current highest bid amount placed on the auction (nullable). |
| **`reserve_limit`** | Numeric | The minimum price the seller is willing to accept (nullable). |
| **`end_time`** | DateTime | The date and time when the auction is scheduled to end. |
| **`status`** | String | The current state: 'active', 'successful', 'unsuccessful', or 'cancelled'. |

#### `Bid`
| Column | Type | Description |
| :--- | :--- | :--- |
| **`bid_id`** | Integer | Unique identifier for the bid (Primary Key). |
| **`auction_id`** | Integer | The auction this bid belongs to (Foreign Key to `auction.auction_id`). |
| **`bidder_id`** | Integer | The user who placed the bid (Foreign Key to `users.user_id`). |
| **`bid_amount`** | Numeric | The actual amount of the bid placed, determined by the proxy bidding logic. |
| **`max_bid`** | Numeric | The maximum amount the bidder is willing to pay (used by proxy bidding system). |
| **`time_placed`** | DateTime | The timestamp when the bid was placed. |

### 3.2 API Schemas
*Location: `backend/app/schemas/auction.py`*

- **`BidBase`**: Includes `bid_amount` (float) and `max_bid` (float).
- **`BidCreate`**: Schema for creating a new bid (inherits from `BidBase`).
- **`Bid`**: Response schema. Includes `bid_id`, `auction_id`, `bidder_id`, and `time_placed`.
- **`AuctionBase`**: Includes `starting_bid` (float), `reserve_limit` (float, optional), and `end_time` (datetime).
- **`AuctionCreate`**: Includes `product_id` (int) and fields from `AuctionBase`.
- **`AuctionUpdate`**: All fields from `AuctionBase` are optional. Also includes `status` (str) and `current_highest_bid` (float).
- **`Auction`**: Full response schema. Includes `auction_id`, `seller_id`, `product_id`, `current_highest_bid`, `winning_buyer_id`, `status`, and `bids` (List[Bid]).

---

## 4. Order & Payment Domain

### 4.1 Database Models
*Location: `backend/app/models/order.py`*

#### `Order`
| Column | Type | Description |
| :--- | :--- | :--- |
| **`order_id`** | Integer | Unique identifier for the order (Primary Key). |
| **`buyer_id`** | Integer | The user who placed the order (Foreign Key to `users.user_id`). |
| **`payment_id`** | Integer | Reference to the associated payment (nullable). |
| **`total_cost`** | Numeric | The total calculated cost of all items in the order. |
| **`shipping_type`** | String | Chosen shipping method (e.g., 'Local Pickup', 'Shipping'). |
| **`shipping_status`** | String | Status of shipment (e.g., 'Not Shipped', 'Shipped', 'Delivered'). |
| **`shipping_address`** | String | Destination address for the shipment (nullable). |

#### `OrderItem`
| Column | Type | Description |
| :--- | :--- | :--- |
| **`order_item_id`** | Integer | Unique identifier for the order item (Primary Key). |
| **`product_id`** | Integer | The product being ordered (Foreign Key to `product.product_id`). |
| **`order_id`** | Integer | The order this item belongs to (Foreign Key to `orders.order_id`). |
| **`quantity`** | Integer | The number of units being ordered. |
| **`price_of_item`** | Numeric | The price of a single unit at the time the order was placed. |

#### `Payment`
| Column | Type | Description |
| :--- | :--- | :--- |
| **`payment_id`** | Integer | Unique identifier for the payment (Primary Key). |
| **`order_id`** | Integer | The order this payment is for (Foreign Key to `orders.order_id`). |
| **`payment_type`** | Enum | The payment provider used (e.g., 'MPESA', 'STRIPE'). |
| **`payment_amount`** | Numeric | The amount of money paid. |
| **`currency`** | String | The currency used for the payment (defaults to 'USD'). |
| **`payment_status`** | Enum | Current status (e.g., 'PENDING', 'COMPLETED', 'FAILED'). |
| **`provider_transaction_id`**| String | Unique transaction identifier from the external gateway (nullable). |
| **`metadata_json`** | JSON | Additional data or response from the payment provider (nullable). |
| **`created_at`** | DateTime | Timestamp when the payment record was created. |
| **`updated_at`** | DateTime | Timestamp when the payment record was last updated (nullable). |

### 4.2 API Schemas
*Location: `backend/app/schemas/order.py`, `backend/app/schemas/payment.py`*

- **`OrderItemBase`**: Includes `product_id` (int) and `quantity` (int).
- **`OrderItemCreate`**: Schema used for creating a new order item (inherits from `OrderItemBase`).
- **`OrderItem`**: Response schema. Includes `order_item_id` and `price_of_item` (float).
- **`OrderBase`**: Includes `shipping_type` (str) and `shipping_address` (str, optional).
- **`OrderCreate`**: Includes `items` (List[OrderItemCreate]).
- **`OrderUpdate`**: `shipping_type`, `shipping_address`, and `shipping_status` are all optional.
- **`Order`**: Response schema. Includes `order_id`, `buyer_id`, `total_cost` (float), `shipping_status`, `payment_id`, and `items` (List[OrderItem]).
- **`PaymentBase`**: Includes `order_id` (int), `payment_type` (PaymentProvider), `payment_amount` (float), and `currency` (str, optional).
- **`PaymentCreate`**: Schema for creating a new payment record (inherits from `PaymentBase`).
- **`PaymentUpdate`**: `payment_status` (PaymentStatus), `provider_transaction_id` (str), and `metadata_json` (Dict[str, Any]) are all optional.
- **`Payment`**: Response schema. Includes `payment_id`, `payment_status` (PaymentStatus), `provider_transaction_id`, `metadata_json`, `created_at`, and `updated_at`.
- **`PaymentInitiate`**: Includes `metadata` (Dict[str, Any], optional).
- **`PaymentResponse`**: Standard response schema inheriting all fields from `Payment`.

---

## 5. Social Domain

### 5.1 Database Models
*Location: `backend/app/models/social.py`*

#### `Message`
| Column | Type | Description |
| :--- | :--- | :--- |
| **`message_id`** | Integer | Unique identifier (Primary Key). |
| **`sender_id`** | Integer | The user who sent the message (Foreign Key to `users.user_id`). |
| **`receiver_id`** | Integer | The user who received the message (Foreign Key to `users.user_id`). |
| **`content`** | Text | The text content of the message. |
| **`time_sent`** | DateTime | The timestamp when the message was sent. |
| **`is_read`** | Boolean | Flag indicating if the receiver has read the message. |

#### `Notification`
| Column | Type | Description |
| :--- | :--- | :--- |
| **`notification_id`** | Integer | Unique identifier (Primary Key). |
| **`user_id`** | Integer | The user who should receive the notification (Foreign Key to `users.user_id`). |
| **`notification_type`** | String | The delivery method (e.g., 'email', 'phone', 'app'). |
| **`is_on`** | Boolean | Flag indicating if this notification type is currently enabled. |
| **`content`** | Text | The text content of the notification (nullable). |

#### `Review`
| Column | Type | Description |
| :--- | :--- | :--- |
| **`review_id`** | Integer | Unique identifier (Primary Key). |
| **`product_id`** | Integer | The product that was reviewed (Foreign Key to `product.product_id`). |
| **`buyer_id`** | Integer | The user who wrote the review (Foreign Key to `users.user_id`). |
| **`seller_id`** | Integer | The seller of the product (Foreign Key to `users.user_id`). |
| **`rating`** | Integer | Star rating given by the buyer, typically 1 to 5. |
| **`comment`** | Text | Optional text comment left by the buyer (nullable). |

### 5.2 API Schemas
*Location: `backend/app/schemas/social.py`*

- **`MessageBase`**: Includes `content` (str) and `receiver_id` (int).
- **`MessageCreate`**: For sending a new message (inherits from `MessageBase`).
- **`Message`**: Response schema. Includes `message_id`, `sender_id`, `time_sent`, and `is_read` (bool).
- **`NotificationBase`**: Includes `content` (str) and `notification_type` (str).
- **`NotificationCreate`**: Schema for creating a new notification.
- **`Notification`**: Response schema. Includes `notification_id`, `user_id`, and `is_on` (bool).
- **`ReviewBase`**: Includes `rating` (int), `comment` (str, optional), and `product_id` (int).
- **`ReviewCreate`**: Schema for creating a new review (inherits from `ReviewBase`).
- **`ReviewUpdate`**: `rating` and `comment` are optional.
- **`Review`**: Response schema. Includes `review_id`, `buyer_id`, and `seller_id`.
