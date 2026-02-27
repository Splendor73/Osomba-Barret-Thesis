# Backend API Endpoints

This document provides a detailed overview of the API endpoints available in the Osomba Marketplace backend.

---

## Auctions API (`/api/v1/auctions`)

Endpoints for managing auctions and bids.

### `GET /`
- **Description:** Retrieves a paginated list of all auctions.
- **Query Parameters:**
  - `skip` (int, optional): Number of records to skip for pagination.
  - `limit` (int, optional): Maximum number of records to return.
- **Responses:**
  - `200 OK`: A list of `Auction` objects.

### `POST /`
- **Description:** Creates a new auction for the currently authenticated user. The user is automatically assigned as the seller.
- **Request Body:** An `AuctionCreate` object.
- **Authentication:** Required.
- **Responses:**
  - `201 Created`: The newly created `Auction` object.

### `GET /{auction_id}`
- **Description:** Retrieves a specific auction by its unique ID.
- **Path Parameters:**
  - `auction_id` (int): The ID of the auction to retrieve.
- **Responses:**
  - `200 OK`: The corresponding `Auction` object.
  - `404 Not Found`: If no auction with the given ID is found.

### `PUT /{auction_id}`
- **Description:** Updates the details of an existing auction. Only the original seller or an admin can perform this action.
- **Path Parameters:**
  - `auction_id` (int): The ID of the auction to update.
- **Request Body:** An `AuctionUpdate` object with the fields to be updated.
- **Authentication:** Required.
- **Responses:**
  - `200 OK`: The updated `Auction` object.
  - `403 Forbidden`: If the current user is not the seller or an admin.
  - `404 Not Found`: If the auction does not exist.

### `POST /{auction_id}/cancel`
- **Description:** Cancels an active auction. Only the original seller or an admin can perform this action.
- **Path Parameters:**
  - `auction_id` (int): The ID of the auction to cancel.
- **Authentication:** Required.
- **Responses:**
  - `200 OK`: The `Auction` object with its status updated to 'cancelled'.
  - `403 Forbidden`: If the current user is not the seller or an admin.
  - `404 Not Found`: If the auction does not exist.

### `POST /{auction_id}/finalize`
- **Description:** Finalizes an auction after its end time has passed. This determines the winner based on the bids and whether the reserve price was met.
- **Path Parameters:**
  - `auction_id` (int): The ID of the auction to finalize.
- **Responses:**
  - `200 OK`: The finalized `Auction` object.
  - `400 Bad Request`: If finalization fails (e.g., auction is still active).
  - `404 Not Found`: If the auction does not exist.

### `POST /{auction_id}/bid`
- **Description:** Places a bid on an active auction. Users cannot bid on their own auctions.
- **Path Parameters:**
  - `auction_id` (int): The ID of the auction to bid on.
- **Request Body:** A `BidCreate` object containing the bid details.
- **Authentication:** Required.
- **Responses:**
  - `200 OK`: The newly created `Bid` object.
  - `400 Bad Request`: If the bid is invalid (e.g., auction is not active, bid is too low, or user is the seller).
  - `404 Not Found`: If the auction does not exist.

---

## Auth API (`/api/v1/auth`)

Endpoints for user authentication and onboarding.

### `GET /me`
- **Description:** Retrieves the profile of the currently authenticated user.
- **Authentication:** Required.
- **Responses:**
  - `200 OK`: A `UserResponse` object for the current user.

### `POST /me`
- **Description:** A Just-In-Time (JIT) provisioning endpoint. If the authenticated user does not exist in the database, they are created. It then returns the user's profile.
- **Request Body:** A `UserJitCreate` object containing terms of service and marketing preferences.
- **Authentication:** Required.
- **Responses:**
  - `200 OK`: The `UserResponse` object for the created or existing user.

### `POST /onboard`
- **Description:** Completes the onboarding process for the current user by adding detailed profile information. This can only be done once.
- **Request Body:** A `UserOnboard` object with detailed profile information.
- **Authentication:** Required.
- **Responses:**
  - `200 OK`: The updated `UserResponse` object.
  - `400 Bad Request`: If the user has already completed the onboarding process.

---

## Messages API (`/api/v1/messages`)

Endpoints for handling user-to-user private messages.

### `POST /`
- **Description:** Sends a new private message to another user.
- **Request Body:** A `MessageCreate` object.
- **Authentication:** Required.
- **Responses:**
  - `200 OK`: The created `Message` object.

### `GET /{other_user_id}`
- **Description:** Retrieves the message history between the current user and another specified user.
- **Path Parameters:**
  - `other_user_id` (int): The ID of the other user in the conversation.
- **Query Parameters:**
  - `skip` (int, optional): Pagination offset.
  - `limit` (int, optional): Pagination limit.
- **Authentication:** Required.
- **Responses:**
  - `200 OK`: A list of `Message` objects.

### `GET /one/{message_id}`
- **Description:** Retrieves a single message by its ID. The user must be the sender, receiver, or an admin.
- **Path Parameters:**
  - `message_id` (int): The ID of the message.
- **Authentication:** Required.
- **Responses:**
  - `200 OK`: The `Message` object.
  - `403 Forbidden`: If the user is not a party to the message or an admin.
  - `404 Not Found`: If the message does not exist.

### `PUT /{message_id}/read`
- **Description:** Marks a message as read. Only the receiver of the message or an admin can perform this action.
- **Path Parameters:**
  - `message_id` (int): The ID of the message to update.
- **Query Parameters:**
  - `is_read` (bool): The new read status.
- **Authentication:** Required.
- **Responses:**
  - `200 OK`: The updated `Message` object.
  - `403 Forbidden`: If the user is not the receiver or an admin.
  - `404 Not Found`: If the message does not exist.

### `DELETE /{message_id}`
- **Description:** Deletes a message. Only the sender or an admin can delete a message.
- **Path Parameters:**
  - `message_id` (int): The ID of the message to delete.
- **Authentication:** Required.
- **Responses:**
  - `200 OK`: The deleted `Message` object.
  - `403 Forbidden`: If the user is not the sender or an admin.
  - `404 Not Found`: If the message does not exist.

### `GET /unread/count`
- **Description:** Retrieves the number of unread messages for the current user.
- **Authentication:** Required.
- **Responses:**
  - `200 OK`: An integer representing the count of unread messages.

---

## Notifications API (`/api/v1/notifications`)

Endpoints for managing user notifications.

### `GET /`
- **Description:** Retrieves the current user's notifications.
- **Query Parameters:**
  - `skip` (int, optional): Pagination offset.
  - `limit` (int, optional): Pagination limit.
- **Authentication:** Required.
- **Responses:**
  - `200 OK`: A list of `Notification` objects.

### `PUT /{notification_id}`
- **Description:** Updates the status of a notification (e.g., enables or disables it). Only the owner or an admin can perform this action.
- **Path Parameters:**
  - `notification_id` (int): The ID of the notification.
- **Query Parameters:**
  - `is_on` (bool): The new status for the notification.
- **Authentication:** Required.
- **Responses:**
  - `200 OK`: The updated `Notification` object.
  - `403 Forbidden`: If the user is not the owner or an admin.
  - `404 Not Found`: If the notification does not exist.

### `DELETE /{notification_id}`
- **Description:** Deletes a notification. Only the owner or an admin can perform this action.
- **Path Parameters:**
  - `notification_id` (int): The ID of the notification to delete.
- **Authentication:** Required.
- **Responses:**
  - `200 OK`: The deleted `Notification` object.
  - `403 Forbidden`: If the user is not the owner or an admin.
  - `404 Not Found`: If the notification does not exist.

---

## Orders API (`/api/v1/orders`)

Endpoints for handling the checkout process and order history.

### `POST /checkout`
- **Description:** Creates a new order from a list of items. This is an atomic operation that will fail if any item is out of stock.
- **Request Body:** An `OrderCreate` object containing the list of items and shipping details.
- **Authentication:** Required.
- **Responses:**
  - `201 Created`: The newly created `Order` object.
  - `400 Bad Request`: If order creation fails (e.g., product out of stock).

### `GET /my-orders`
- **Description:** Retrieves all orders for the currently authenticated user.
- **Query Parameters:**
  - `skip` (int, optional): Pagination offset.
  - `limit` (int, optional): Pagination limit.
- **Authentication:** Required.
- **Responses:**
  - `200 OK`: A list of the user's `Order` objects.

### `GET /`
- **Description:** Retrieves all orders in the system. **Admin only.**
- **Query Parameters:**
  - `skip` (int, optional): Pagination offset.
  - `limit` (int, optional): Pagination limit.
- **Authentication:** Required (admin only).
- **Responses:**
  - `200 OK`: A list of all `Order` objects.
  - `403 Forbidden`: If the user is not an admin.

### `GET /{order_id}`
- **Description:** Retrieves a specific order by ID. The user must be the buyer of the order or an admin.
- **Path Parameters:**
  - `order_id` (int): The ID of the order.
- **Authentication:** Required.
- **Responses:**
  - `200 OK`: The `Order` object.
  - `403 Forbidden`: If the user is not the buyer or an admin.
  - `404 Not Found`: If the order does not exist.

### `PUT /{order_id}`
- **Description:** Updates an order's details, such as its shipping status. **Admin only.**
- **Path Parameters:**
  - `order_id` (int): The ID of the order to update.
- **Request Body:** An `OrderUpdate` object with the fields to update.
- **Authentication:** Required (admin only).
- **Responses:**
  - `200 OK`: The updated `Order` object.
  - `403 Forbidden`: If the user is not an admin.
  - `404 Not Found`: If the order does not exist.

### `DELETE /{order_id}`
- **Description:** Deletes an order from the system. **Admin only.**
- **Path Parameters:**
  - `order_id` (int): The ID of the order to delete.
- **Authentication:** Required (admin only).
- **Responses:**
  - `200 OK`: The deleted `Order` object.
  - `403 Forbidden`: If the user is not an admin.
  - `404 Not Found`: If the order does not exist.

---

## Payments API (`/api/v1/payments`)

Endpoints for processing payments.

### `POST /initiate`
- **Description:** Initiates a payment request for an order with a selected third-party provider.
- **Request Body:** A `PaymentInitiate` object.
- **Authentication:** Required.
- **Responses:**
  - `200 OK`: A `PaymentResponse` object containing details from the payment provider (e.g., a redirect URL or payment ID).
  - `400 Bad Request`: If payment initiation fails.

### `GET /verify/{payment_id}`
- **Description:** Verifies the status of a payment after the user has interacted with the payment provider.
- **Path Parameters:**
  - `payment_id` (int): The ID of the payment to verify.
- **Authentication:** Required.
- **Responses:**
  - `200 OK`: A `PaymentResponse` object with the updated payment status.
  - `400 Bad Request`: If verification fails.
  - `404 Not Found`: If the payment does not exist.

### `GET /`
- **Description:** Retrieves all payment records. **Admin only.**
- **Query Parameters:**
  - `skip` (int, optional): Pagination offset.
  - `limit` (int, optional): Pagination limit.
- **Authentication:** Required (admin only).
- **Responses:**
  - `200 OK`: A list of `Payment` objects.
  - `403 Forbidden`: If the user is not an admin.

### `GET /{payment_id}`
- **Description:** Retrieves a specific payment by ID. **Admin only.**
- **Path Parameters:**
  - `payment_id` (int): The ID of the payment.
- **Authentication:** Required (admin only).
- **Responses:**
  - `200 OK`: The `Payment` object.
  - `403 Forbidden`: If the user is not an admin.
  - `404 Not Found`: If the payment does not exist.

### `PUT /{payment_id}`
- **Description:** Updates a payment record. **Admin only.**
- **Path Parameters:**
  - `payment_id` (int): The ID of the payment to update.
- **Request Body:** A `PaymentUpdate` object.
- **Authentication:** Required (admin only).
- **Responses:**
  - `200 OK`: The updated `Payment` object.
  - `403 Forbidden`: If the user is not an admin.

### `DELETE /{payment_id}`
- **Description:** Deletes a payment record. **Admin only.**
- **Path Parameters:**
  - `payment_id` (int): The ID of the payment to delete.
- **Authentication:** Required (admin only).
- **Responses:**
  - `200 OK`: The deleted `Payment` object.
  - `403 Forbidden`: If the user is not an admin.
  - `404 Not Found`: If the payment does not exist.

---

## Products API (`/api/v1/products`)

Endpoints for managing the product catalog.

### `GET /`
- **Description:** Retrieves a paginated list of all available products.
- **Query Parameters:**
  - `skip` (int, optional): Pagination offset.
  - `limit` (int, optional): Pagination limit.
- **Responses:**
  - `200 OK`: A list of `Product` objects.

### `POST /`
- **Description:** Adds a new product to the catalog. The authenticated user is set as the seller.
- **Request Body:** A `ProductCreate` object.
- **Authentication:** Required.
- **Responses:**
  - `201 Created`: The newly created `Product` object.

### `GET /{product_id}`
- **Description:** Retrieves a specific product by its ID.
- **Path Parameters:**
  - `product_id` (int): The ID of the product.
- **Responses:**
  - `200 OK`: The `Product` object.
  - `404 Not Found`: If the product does not exist.

### `PUT /{product_id}`
- **Description:** Updates an existing product. Only the seller or an admin can perform this action.
- **Path Parameters:**
  - `product_id` (int): The ID of the product to update.
- **Request Body:** A `ProductUpdate` object with the fields to update.
- **Authentication:** Required.
- **Responses:**
  - `200 OK`: The updated `Product` object.
  - `403 Forbidden`: If the user is not the seller or an admin.
  - `404 Not Found`: If the product does not exist.

### `DELETE /{product_id}`
- **Description:** Deletes a product from the catalog. Only the seller or an admin can perform this action.
- **Path Parameters:**
  - `product_id` (int): The ID of the product to delete.
- **Authentication:** Required.
- **Responses:**
  - `200 OK`: The deleted `Product` object.
  - `403 Forbidden`: If the user is not the seller or an admin.
  - `404 Not Found`: If the product does not exist.

---

## Reviews API (`/api/v1/reviews`)

Endpoints for managing product and seller reviews.

### `POST /`
- **Description:** Creates a new review for a product. The authenticated user is set as the buyer.
- **Request Body:** A `ReviewCreate` object.
- **Authentication:** Required.
- **Responses:**
  - `201 Created`: The newly created `Review` object.

### `GET /product/{product_id}`
- **Description:** Retrieves all reviews for a specific product.
- **Path Parameters:**
  - `product_id` (int): The ID of the product.
- **Query Parameters:**
  - `skip` (int, optional): Pagination offset.
  - `limit` (int, optional): Pagination limit.
- **Responses:**
  - `200 OK`: A list of `Review` objects.

### `GET /seller/{seller_id}`
- **Description:** Retrieves all reviews for a specific seller.
- **Path Parameters:**
  - `seller_id` (int): The ID of the seller.
- **Query Parameters:**
  - `skip` (int, optional): Pagination offset.
  - `limit` (int, optional): Pagination limit.
- **Responses:**
  - `200 OK`: A list of `Review` objects.

### `GET /{review_id}`
- **Description:** Retrieves a specific review by its ID.
- **Path Parameters:**
  - `review_id` (int): The ID of the review.
- **Responses:**
  - `200 OK`: The `Review` object.
  - `404 Not Found`: If the review does not exist.

### `PUT /{review_id}`
- **Description:** Updates an existing review. Only the original author or an admin can perform this action.
- **Path Parameters:**
  - `review_id` (int): The ID of the review to update.
- **Request Body:** A `ReviewUpdate` object.
- **Authentication:** Required.
- **Responses:**
  - `200 OK`: The updated `Review` object.
  - `403 Forbidden`: If the user is not the author or an admin.
  - `404 Not Found`: If the review does not exist.

### `DELETE /{review_id}`
- **Description:** Deletes a review. Only the original author or an admin can perform this action.
- **Path Parameters:**
  - `review_id` (int): The ID of the review to delete.
- **Authentication:** Required.
- **Responses:**
  - `200 OK`: The deleted `Review` object.
  - `403 Forbidden`: If the user is not the author or an admin.
  - `404 Not Found`: If the review does not exist.

---

## Users API (`/api/v1/users`)

Endpoints for managing user profiles.

### `GET /`
- **Description:** Retrieves all users. **Admin only.**
- **Query Parameters:**
  - `skip` (int, optional): Pagination offset.
  - `limit` (int, optional): Pagination limit.
- **Authentication:** Required (admin only).
- **Responses:**
  - `200 OK`: A list of `UserResponse` objects.
  - `403 Forbidden`: If the user is not an admin.

### `GET /{user_id}`
- **Description:** Retrieves a specific user by ID.
- **Path Parameters:**
  - `user_id` (int): The ID of the user.
- **Responses:**
  - `200 OK`: The `UserResponse` object.
  - `404 Not Found`: If the user does not exist.

### `PUT /{user_id}`
- **Description:** Updates a user's profile. Users can only update their own profile unless they are an admin.
- **Path Parameters:**
  - `user_id` (int): The ID of the user to update.
- **Request Body:** A `UserUpdate` object.
- **Authentication:** Required.
- **Responses:**
  - `200 OK`: The updated `UserResponse` object.
  - `403 Forbidden`: If the user is not authorized.
  - `404 Not Found`: If the user does not exist.

### `DELETE /{user_id}`
- **Description:** Deletes a user. **Admin only.**
- **Path Parameters:**
  - `user_id` (int): The ID of the user to delete.
- **Authentication:** Required (admin only).
- **Responses:**
  - `200 OK`: The deleted `UserResponse` object.
  - `403 Forbidden`: If the user is not an admin.
  - `404 Not Found`: If the user does not exist.
