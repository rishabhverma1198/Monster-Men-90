# **App Name**: MonserMens90

## Core Features:

- Product Browsing: Allows users to browse products with filtering (size, price, category) and search by tags.
- Product Details Page: Displays product information including images, name, category, description, price, and size-wise stock availability.
- Cart System: Enables users to add products to a cart with details like product name, size, quantity, and price.
- Checkout Process: Asks users for their name and phone number to confirm the order.
- WhatsApp Order Notification: Generates a wa.me link with pre-filled order details (name, phone number, order ID, cart items) to be sent to the admin.
- Order Submission and Data Storage: Saves the order details (orderId, name, phone, items, status, createdAt) into Firestore's 'orders_leads' collection.
- Order Tracking: Enables users to track their order status using their phone number and order ID, fetching data from Firestore.
- Admin Panel for Order Management: Allows the admin to view all orders, update their status, and manage customer information.
- Admin Panel for Product Upload: Admin can upload and manage product information, including images, description, price, and stock.

## Style Guidelines:

- Primary color: Dark, muted blue (#34495E) to convey trust and reliability.
- Background color: Light gray (#ECF0F1) to ensure content readability.
- Accent color: Vivid orange (#E67E22) for interactive elements, to add vibrancy and call attention to important actions.
- Font: 'Inter', a sans-serif font for clear and modern text presentation, for both body and headline text.
- Use minimalist icons for categories and filters to maintain a clean and modern design.
- A clean, grid-based layout for product listings to provide a structured and visually appealing experience.
- Subtle transition animations on hover and when updating the cart to enhance user engagement without being intrusive.