# Backend CRUD Functions

This document provides a detailed overview of the CRUD (Create, Read, Update, Delete) functions used in the Osomba Marketplace backend. These functions contain the core business logic for interacting with the database models.

---

## `crud/auction.py`

Handles the logic for auctions and bidding.

### `get_auction`
- **Description:** Retrieves a single auction by its ID.
- **Parameters:**
  - `db: Session`: The database session.
  - `auction_id: int`: The ID of the auction to retrieve.
- **Returns:** The `Auction` object or `None` if not found.

### `get_auctions`
- **Description:** Retrieves a list of auctions with pagination.
- **Parameters:**
  - `db: Session`: The database session.
  - `skip: int`: The number of records to skip.
  - `limit: int`: The maximum number of records to return.
- **Returns:** A list of `Auction` objects.

### `create_auction`
- **Description:** Creates a new auction.
- **Parameters:**
  - `db: Session`: The database session.
  - `auction: AuctionCreate`: The data for the new auction.
  - `seller_id: int`: The ID of the user selling the item.
- **Returns:** The newly created `Auction` object.

### `update_auction`
- **Description:** Updates an existing auction's details.
- **Parameters:**
  - `db: Session`: The database session.
  - `auction_id: int`: The ID of the auction to update.
  - `auction_update: AuctionUpdate`: The new data for the auction.
- **Returns:** The updated `Auction` object or `None` if the auction was not found.

### `cancel_auction`
- **Description:** Sets an auction's status to 'cancelled'.
- **Parameters:**
  - `db: Session`: The database session.
  - `auction_id: int`: The ID of the auction to cancel.
- **Returns:** The updated `Auction` object with the new status.

### `get_bid_increment`
- **Description:** Calculates the appropriate bid increment based on the current highest bid amount. This is used to determine the minimum next valid bid.
- **Parameters:**
  - `current_bid: float`: The current highest bid on the auction.
- **Returns:** A `float` representing the minimum amount for the next bid increment.

### `place_bid`
- **Description:** Places a bid on an auction. This function includes complex business logic for proxy bidding (automatically bidding up to a user's `max_bid`) and anti-sniping (extending the auction time if a bid is placed in the final minutes).
- **Parameters:**
  - `db: Session`: The database session.
  - `auction_id: int`: The ID of the auction to bid on.
  - `bidder_id: int`: The ID of the user placing the bid.
  - `bid_data: BidCreate`: The bidding data, including the user's maximum bid.
- **Returns:** The newly created `Bid` object.
- **Raises:** `ValueError` if the auction is not active, has ended, or if the bid is invalid.

### `finalize_auction`
- **Description:** Closes an auction after its end time. It checks if the reserve price was met and sets the final status of the auction ('successful' or 'unsuccessful').
- **Parameters:**
  - `db: Session`: The database session.
  - `auction_id: int`: The ID of the auction to finalize.
- **Returns:** A string indicating the outcome of the finalization.
- **Raises:** `ValueError` if the auction is still active.

---

## `crud/message.py`

Handles the logic for user-to-user messaging.

### `get_message_by_id`
- **Description:** Retrieves a single message by its ID.
- **Parameters:**
  - `db: Session`: The database session.
  - `message_id: int`: The ID of the message.
- **Returns:** The `Message` object or `None`.

### `create_message`
- **Description:** Creates and saves a new message.
- **Parameters:**
  - `db: Session`: The database session.
  - `message: MessageCreate`: The message content and receiver ID.
  - `sender_id: int`: The ID of the user sending the message.
- **Returns:** The created `Message` object.

### `get_messages_between_users`
- **Description:** Retrieves the message history between two specific users, ordered by time sent.
- **Parameters:**
  - `db: Session`: The database session.
  - `user1_id: int`: The ID of the first user.
  - `user2_id: int`: The ID of the second user.
  - `skip: int`: Pagination offset.
  - `limit: int`: Pagination limit.
- **Returns:** A list of `Message` objects.

### `get_unread_count`
- **Description:** Counts the number of unread messages for a specific user.
- **Parameters:**
  - `db: Session`: The database session.
  - `user_id: int`: The ID of the user.
- **Returns:** An `int` representing the count of unread messages.

### `update_message_read_status`
- **Description:** Updates the `is_read` status of a message.
- **Parameters:**
  - `db: Session`: The database session.
  - `message_id: int`: The ID of the message to update.
  - `is_read: bool`: The new read status.
- **Returns:** The updated `Message` object.

### `delete_message`
- **Description:** Deletes a message from the database.
- **Parameters:**
  - `db: Session`: The database session.
  - `message_id: int`: The ID of the message to delete.
- **Returns:** The `Message` object that was deleted or `None`.

---

## `crud/notification.py`

Handles the logic for user notifications.

### `get_notification_by_id`
- **Description:** Retrieves a single notification by its ID.
- **Parameters:**
  - `db: Session`: The database session.
  - `notification_id: int`: The ID of the notification.
- **Returns:** The `Notification` object or `None`.

### `create_notification`
- **Description:** Creates a new notification for a user.
- **Parameters:**
  - `db: Session`: The database session.
  - `notification: NotificationCreate`: The notification data.
  - `user_id: int`: The ID of the user to notify.
- **Returns:** The created `Notification` object.

### `get_user_notifications`
- **Description:** Retrieves all notifications for a specific user.
- **Parameters:**
  - `db: Session`: The database session.
  - `user_id: int`: The ID of the user.
  - `skip: int`: Pagination offset.
  - `limit: int`: Pagination limit.
- **Returns:** A list of `Notification` objects.

### `update_notification_status`
- **Description:** Updates the `is_on` status of a notification (e.g., enabling or disabling it).
- **Parameters:**
  - `db: Session`: The database session.
  - `notification_id: int`: The ID of the notification to update.
  - `is_on: bool`: The new status.
- **Returns:** The updated `Notification` object.

### `delete_notification`
- **Description:** Deletes a notification.
- **Parameters:**
  - `db: Session`: The database session.
  - `notification_id: int`: The ID of the notification to delete.
- **Returns:** The deleted `Notification` object or `None`.

---

## `crud/order.py`

Handles the logic for orders and checkout.

### `create_order`
- **Description:** Creates a new order in an atomic transaction. It validates product stock, subtracts the quantity, calculates the total cost, and creates the associated order items.
- **Parameters:**
  - `db: Session`: The database session.
  - `order: OrderCreate`: The order data, including the list of items.
  - `buyer_id: int`: The ID of the user placing the order.
- **Returns:** The newly created `Order` object.
- **Raises:** `ValueError` if a product is not found or has insufficient stock.

### `get_order_by_id`
- **Description:** Retrieves a single order by its ID.
- **Parameters:**
  - `db: Session`: The database session.
  - `order_id: int`: The ID of the order.
- **Returns:** The `Order` object or `None`.

### `get_orders_by_user_id`
- **Description:** Retrieves all orders placed by a specific user.
- **Parameters:**
  - `db: Session`: The database session.
  - `buyer_id: int`: The ID of the buyer.
  - `skip: int`: Pagination offset.
  - `limit: int`: Pagination limit.
- **Returns:** A list of `Order` objects.

### `get_all_orders`
- **Description:** Retrieves all orders in the system (for admin use).
- **Parameters:**
  - `db: Session`: The database session.
  - `skip: int`: Pagination offset.
  - `limit: int`: Pagination limit.
- **Returns:** A list of all `Order` objects.

### `update_order`
- **Description:** Updates an existing order's details (e.g., shipping status).
- **Parameters:**
  - `db: Session`: The database session.
  - `order_id: int`: The ID of the order to update.
  - `order_update: OrderUpdate`: The new data for the order.
- **Returns:** The updated `Order` object.

### `delete_order`
- **Description:** Deletes an order. Note: This also deletes all associated `OrderItem` records due to cascading settings.
- **Parameters:**
  - `db: Session`: The database session.
  - `order_id: int`: The ID of the order to delete.
- **Returns:** The deleted `Order` object.

---

## `crud/payment.py`

Handles the logic for payments.

### `create_payment`
- **Description:** Creates a new payment record in the database.
- **Parameters:**
  - `db: Session`: The database session.
  - `payment: PaymentCreate`: The data for the new payment.
- **Returns:** The created `Payment` object.

### `get_payment_by_id`
- **Description:** Retrieves a single payment by its ID.
- **Parameters:**
  - `db: Session`: The database session.
  - `payment_id: int`: The ID of the payment.
- **Returns:** The `Payment` object or `None`.

### `get_all_payments`
- **Description:** Retrieves all payment records (for admin use).
- **Parameters:**
  - `db: Session`: The database session.
  - `skip: int`: Pagination offset.
  - `limit: int`: Pagination limit.
- **Returns:** A list of `Payment` objects.

### `update_payment`
- **Description:** Updates an existing payment's details (e.g., status, transaction ID).
- **Parameters:**
  - `db: Session`: The database session.
  - `payment_id: int`: The ID of the payment to update.
  - `payment_update: PaymentUpdate`: The new data for the payment.
- **Returns:** The updated `Payment` object.

### `delete_payment`
- **Description:** Deletes a payment record.
- **Parameters:**
  - `db: Session`: The database session.
  - `payment_id: int`: The ID of the payment to delete.
- **Returns:** The deleted `Payment` object.

---

## `crud/product.py`

Handles the logic for products.

### `get_product`
- **Description:** Retrieves a single product by its ID.
- **Parameters:**
  - `db: Session`: The database session.
  - `product_id: int`: The ID of the product.
- **Returns:** The `Product` object or `None`.

### `get_products`
- **Description:** Retrieves a list of all products with pagination.
- **Parameters:**
  - `db: Session`: The database session.
  - `skip: int`: Pagination offset.
  - `limit: int`: Pagination limit.
- **Returns:** A list of `Product` objects.

### `get_products_by_seller`
- **Description:** Retrieves all products listed by a specific seller.
- **Parameters:**
  - `db: Session`: The database session.
  - `seller_id: int`: The ID of the seller.
  - `only_available: bool`: If `True`, only returns products with a quantity greater than 0.
- **Returns:** A list of `Product` objects.

### `create_product`
- **Description:** Creates a new product.
- **Parameters:**
  - `db: Session`: The database session.
  - `product: ProductCreate`: The data for the new product.
  - `seller_id: int`: The ID of the seller listing the product.
- **Returns:** The created `Product` object.

### `update_product`
- **Description:** Updates an existing product's details.
- **Parameters:**
  - `db: Session`: The database session.
  - `product_id: int`: The ID of the product to update.
  - `product_update: ProductUpdate`: The new data for the product.
- **Returns:** The updated `Product` object.

### `delete_product`
- **Description:** Deletes a product.
- **Parameters:**
  - `db: Session`: The database session.
  - `product_id: int`: The ID of the product to delete.
- **Returns:** The deleted `Product` object.

---

## `crud/review.py`

Handles the logic for product and seller reviews.

### `create_review`
- **Description:** Creates a new review for a product. It automatically fetches the `seller_id` from the product being reviewed.
- **Parameters:**
  - `db: Session`: The database session.
  - `review: ReviewCreate`: The review data, including rating, comment, and product ID.
  - `buyer_id: int`: The ID of the user writing the review.
- **Returns:** The created `Review` object.
- **Raises:** `ValueError` if the product is not found.

### `get_product_reviews`
- **Description:** Retrieves all reviews for a specific product.
- **Parameters:**
  - `db: Session`: The database session.
  - `product_id: int`: The ID of the product.
  - `skip: int`: Pagination offset.
  - `limit: int`: Pagination limit.
- **Returns:** A list of `Review` objects.

### `get_seller_reviews`
- **Description:** Retrieves all reviews for a specific seller.
- **Parameters:**
  - `db: Session`: The database session.
  - `seller_id: int`: The ID of the seller.
  - `skip: int`: Pagination offset.
  - `limit: int`: Pagination limit.
- **Returns:** A list of `Review` objects.

### `get_review_by_id`
- **Description:** Retrieves a single review by its ID.
- **Parameters:**
  - `db: Session`: The database session.
  - `review_id: int`: The ID of the review.
- **Returns:** The `Review` object or `None`.

### `update_review`
- **Description:** Updates an existing review.
- **Parameters:**
  - `db: Session`: The database session.
  - `review_id: int`: The ID of the review to update.
  - `review_update: ReviewUpdate`: The new data for the review.
- **Returns:** The updated `Review` object.

### `delete_review`
- **Description:** Deletes a review.
- **Parameters:**
  - `db: Session`: The database session.
  - `review_id: int`: The ID of the review to delete.
- **Returns:** The deleted `Review` object.

---

## `crud/user.py`

Handles the logic for users.

### `get_user_by_id`
- **Description:** Retrieves a user by their primary key ID.
- **Parameters:**
  - `db: Session`: The database session.
  - `user_id: int`: The ID of the user.
- **Returns:** The `User` object or `None`.

### `get_all_users`
- **Description:** Retrieves a list of all users (for admin use).
- **Parameters:**
  - `db: Session`: The database session.
  - `skip: int`: Pagination offset.
  - `limit: int`: Pagination limit.
- **Returns:** A list of `User` objects.

### `create_user`
- **Description:** Creates a new user record, typically during the initial sign-up process.
- **Parameters:**
  - `db: Session`: The database session.
  - `email: str`: The user's email.
  - `cognito_sub: str`: The user's unique identifier from Cognito.
  - `terms_version: str`: The version of the terms and conditions accepted.
  - `marketing_opt_in: bool`: Whether the user opted into marketing.
- **Returns:** The newly created `User` object.

### `update_user`
- **Description:** Updates a user's profile information.
- **Parameters:**
  - `db: Session`: The database session.
  - `user_id: int`: The ID of the user to update.
  - `user_update: UserUpdate`: The new data for the user.
- **Returns:** The updated `User` object.

### `delete_user`
- **Description:** Deletes a user from the database.
- **Parameters:**
  - `db: Session`: The database session.
  - `user_id: int`: The ID of the user to delete.
- **Returns:** The deleted `User` object.

### `get_user_by_email`
- **Description:** Retrieves a user by their email address.
- **Parameters:**
  - `db: Session`: The database session.
  - `email: str`: The email to search for.
- **Returns:** The `User` object or `None`.

### `get_user_by_phone`
- **Description:** Retrieves a user by their phone number.
- **Parameters:**
  - `db: Session`: The database session.
  - `phone: str`: The phone number to search for.
- **Returns:** The `User` object or `None`.

### `get_user_by_username`
- **Description:** Retrieves a user by their username.
- **Parameters:**
  - `db: Session`: The database session.
  - `username: str`: The username to search for.
- **Returns:** The `User` object or `None`.

### `enable_2fa`
- **Description:** Enables two-factor authentication for a user and stores their 2FA secret key.
- **Parameters:**
  - `db: Session`: The database session.
  - `user_id: int`: The ID of the user.
  - `secret_key: str`: The 2FA secret key.
- **Returns:** The updated `User` object.

### `disable_2fa`
- **Description:** Disables two-factor authentication for a user.
- **Parameters:**
  - `db: Session`: The database session.
  - `user_id: int`: The ID of the user.
- **Returns:** The updated `User` object.

### `onboard_user`
- **Description:** Updates a user's record with their detailed profile information from the onboarding process and marks them as `is_onboarded`.
- **Parameters:**
  - `db: Session`: The database session.
  - `user: User`: The existing user object.
  - `onboard_data: UserOnboard`: The onboarding data to apply.
- **Returns:** The updated and onboarded `User` object.
