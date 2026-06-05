# EventBridge Commerce: Enterprise Microservices Messaging Platform

## Executive Summary
EventBridge Commerce is a professional enterprise microservices messaging showcase that demonstrates how independent business services coordinate order-processing workflows through event streaming, reliable queue-based routing, retry handling, and dead letter queue processing. The project is designed as a stakeholder-ready live architecture demo and technical portfolio project using Spring Boot Microservices Architecture, Kafka, and RabbitMQ.

## Project Purpose
To provide a concrete, production-grade reference architecture illustrating how decoupled services interact asynchronously in high-volume environments. By separating logical business domains (ordering, payments, inventory, fulfillment, alerts) into containerized modules and connecting them via message brokers, the platform achieves high scalability, failure containment, and real-time operational tracing.

## Exact Tech Stack
Spring Boot Microservices Architecture, Kafka, RabbitMQ

## Business Problem
Enterprise order-processing systems often become tightly coupled when payment, inventory, shipping, and notification workflows depend directly on each other. This creates scalability issues, failure propagation, slower processing, and poor visibility into distributed workflows. EventBridge Commerce demonstrates how asynchronous communication and clear service boundaries can improve reliability, scalability, and operational control.

## Architecture Overview
The architecture separates business capabilities into independent microservices. Order Service publishes order events, Payment Service reacts to payment-related events, Inventory Service manages reservation events, Shipping Service coordinates fulfillment events, and Notification Service processes customer and operations messages. Kafka is used for business event streaming, while RabbitMQ is used for reliable message routing, retry processing, and dead letter queue handling.

### Core Workflow Pattern
1. **Customer Order Created**
   - Transmitted to the **Order Service**.
2. **Event Broadcast**
   - **Order Service** emits `order-created` to **Kafka Event Stream**.
3. **Downstream Consumption**
   - **Payment Service** handles authentication and emits `payment-approved`.
   - **Inventory Service** locks stock allocation and emits `inventory-reserved`.
   - **Shipping Service** coordinates fulfillment carrier manifests and emits `shipment-created`.
4. **Targeted Job Queue Routing**
   - **RabbitMQ Message Queue** routes dispatch notifications.
5. **Fulfillment Confirmation**
   - **Notification Service** delivers alerts.
   - **Customer Notification Sent**.

## Microservices Responsibilities

### 1. Order Service
- **Business Responsibility**: Handles customer order intake, validates order details, manages order lifecycle status, and publishes order-created events.
- **Input**: Customer order request
- **Output**: order-created event
- **Failure Scenario**: Invalid order details, duplicate order request, or order validation failure

### 2. Payment Service
- **Business Responsibility**: Consumes order-created events, processes payment validation, determines payment status, and publishes payment-approved or payment-failed events.
- **Input**: order-created event
- **Output**: payment-approved event or payment-failed event
- **Failure Scenario**: Payment declined, payment timeout, or payment processing failure

### 3. Inventory Service
- **Business Responsibility**: Consumes payment-approved events, reserves inventory, releases inventory when downstream processing fails, and publishes inventory-reserved or inventory-rejected events.
- **Input**: payment-approved event
- **Output**: inventory-reserved event or inventory-rejected event
- **Failure Scenario**: Item out of stock, reservation timeout, or inventory conflict

### 4. Shipping Service
- **Business Responsibility**: Consumes inventory-reserved events, creates shipment records, updates fulfillment progress, and publishes shipment-created events.
- **Input**: inventory-reserved event
- **Output**: shipment-created event
- **Failure Scenario**: Shipping provider unavailable, invalid address, or shipment creation failure

### 5. Notification Service
- **Business Responsibility**: Consumes notification messages from RabbitMQ and sends customer-facing and operations-facing updates.
- **Input**: notification message
- **Output**: customer-notified message
- **Failure Scenario**: Notification delivery failure, retry exhausted, or message sent to dead letter queue

## Messaging Flow
The system leverages two distinct communication patterns depending on the business requirements:

### A. Event Streaming Flow
- **Flow**: Order Created → Payment Started → Payment Approved → Inventory Reserved → Shipment Created
- **Operational Principle**: Events are facts that already happened. Kafka is used for event streaming when multiple services may need to react to the same business event.

### B. Queue-Based Message Flow
- **Flow**: Notification Requested → RabbitMQ Message Queue → Notification Service → Notification Sent
- **Operational Principle**: Messages represent work that needs to be processed. RabbitMQ is used for reliable routing, retry handling, and task-based processing.

## Failure Handling Strategy
The project demonstrates a production-style failure handling strategy. When message processing fails, the message is routed through retry attempts. If the message continues to fail after the retry limit is reached, it is moved to a dead letter queue. This prevents message loss, isolates problematic workflows, and gives operations teams a clear review path.

### Failure Handling Flow
- **Flow**: Message Processing Failed → Retry Attempt 1 → Retry Attempt 2 → Retry Attempt 3 → Dead Letter Queue → Operations Review
- **Retry Mechanics**: Temporary issues (SMTP drops, transient API timeouts) trigger retry limits with backoffs.
- **Isolating Bad Messages**: After three unsuccessful attempts, payloads are redirected to a Dead Letter Queue (DLQ) for operations analysis without blocking queue consumers.

## Live Workflow Simulation
The portfolio website features an interactive workflow simulator that replicates normal and failure processing paths in real-time, complete with:
- **Interactive Control Buttons**: Trigger normal runs, simulate timeouts, or reset logs.
- **Dynamic Connection Highlighting**: SVG vector tracks glow to display real-time message routes.
- **Console Terminal Panel**: Simulates logger prints at every service micro-segment.
- **Broker State Counters**: Traces simulated Kafka offsets, RabbitMQ queue sizes, retry tallies, and DLQ counts.

## Stakeholder Value
- **Faster order processing** through asynchronous workflow coordination.
- **Better scalability** because services can operate independently.
- **Reduced coupling** between business capabilities.
- **Improved reliability** through retry and dead letter handling.
- **Better operational visibility** across distributed workflows.
- **Easier maintenance** due to clear service boundaries.
- **Safer failure management** because failed messages are isolated for review.

## Architecture Decisions

### Decision 1: Independent service ownership
- **Explanation**: Each service owns one business capability so changes in payment, inventory, shipping, or notification logic do not require changing the entire system.

### Decision 2: Event-driven communication
- **Explanation**: Services communicate through events so they do not need to wait for direct synchronous responses from every downstream system.

### Decision 3: Kafka for event streaming
- **Explanation**: Kafka is used when business events need to be published and consumed across multiple services.

### Decision 4: RabbitMQ for reliable task routing
- **Explanation**: RabbitMQ is used when a specific task needs to be routed, retried, and tracked reliably.

### Decision 5: Failure handling through retries and dead letter queues
- **Explanation**: Temporary failures are retried, and permanently failed messages are moved to a dead letter queue for review.

## How to Present This Project
When walking stakeholders or interviewers through the system, you can use the following presentation script:

> “EventBridge Commerce is an enterprise microservices messaging platform designed to demonstrate how distributed business services communicate through asynchronous messaging. I designed the system around independent service ownership, where each service is responsible for a specific business capability such as order processing, payment validation, inventory reservation, shipping coordination, and customer notification.
> 
> The architecture uses Spring Boot Microservices Architecture to separate service boundaries. Kafka is used for event streaming between services when multiple business capabilities need to react to events such as order-created or payment-approved. RabbitMQ is used for reliable message routing, retry workflows, and notification delivery.
> 
> One of the most important parts of this project is the failure handling design. Instead of losing failed messages, the platform routes them through retry attempts and eventually into a dead letter queue when manual review is required. This demonstrates production-aware thinking around reliability, fault isolation, and operational visibility.
> 
> The goal of this project is not only to show technical implementation knowledge, but also to show that I can explain distributed architecture clearly to stakeholders and technical teams.”

## Resume Alignment
This project aligns with a Senior Software Engineer profile by demonstrating:
- Enterprise microservices architecture
- Event-driven backend design
- Distributed messaging workflows
- Service boundary design
- Messaging reliability
- Retry and dead letter queue handling
- Stakeholder communication
- System design presentation skills
- Production-style architecture thinking

## Resume Bullet Points
- Designed an enterprise event-driven microservices messaging platform using Spring Boot Microservices Architecture, Kafka, and RabbitMQ to demonstrate scalable order-processing workflows.
- Modeled asynchronous communication across order, payment, inventory, shipping, and notification services to improve service independence and workflow reliability.
- Created a stakeholder-facing live architecture demo explaining event streaming, queue-based routing, retry handling, and dead letter queue processing.
- Demonstrated production-style failure handling patterns including retry queues, dead letter queues, and operations review workflows.
- Presented clear service ownership boundaries and messaging flow decisions for distributed enterprise systems.

## Interview Talking Points
- I separated the system into independent microservices based on business capabilities.
- I used event-driven communication to reduce tight coupling between services.
- I used Kafka for high-throughput business event streaming.
- I used RabbitMQ for reliable task routing and retry-based processing.
- I designed retry and dead letter queue flows for production-style failure handling.
- I focused on clear architecture communication so both technical and non-technical stakeholders can understand the project.
- I designed the workflow around real enterprise order-processing patterns.
- I can explain why Kafka and RabbitMQ serve different messaging needs in the same architecture.

## Local Run Instructions
To review the stakeholder-facing demo website locally:
1. Clone the repository to your local machine:
   ```bash
   git clone <your-repository-url>
   cd eventbridge-commerce-microservices-messaging
   ```
2. Start a local web server (e.g. using Node's `http-server` or python's built-in module):
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Or using Node (if installed)
   npx http-server -p 8000
   ```
3. Open your browser and navigate to `http://localhost:8000`.

## Vercel Deployment Instructions
To host this portfolio project live on Vercel:
1. Initialize git and commit your files:
   ```bash
   git init
   git add .
   git commit -m "feat: complete enterprise architecture showcase website"
   ```
2. Create a new repository on GitHub and push the code:
   ```bash
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```
3. Sign in to your [Vercel Dashboard](https://vercel.com).
4. Click **Add New** → **Project** and select your GitHub repository.
5. In the configuration window, leave all default settings (Vercel automatically detects the HTML/CSS static project structure).
6. Click **Deploy**. Vercel will build and serve your site within seconds.
7. Copy the deployment URL and paste it at the top of this README as your live project link.

## GitHub Repository Description
Enterprise event-driven microservices messaging platform showcasing Spring Boot Microservices Architecture, Kafka, and RabbitMQ through a stakeholder-ready live workflow and architecture demo.
