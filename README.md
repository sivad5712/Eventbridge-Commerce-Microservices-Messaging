# EventBridge Commerce: Enterprise Microservices Messaging Platform

## Live Demo

View Project: [https://eventbridge-commerce-microservices.vercel.app](https://eventbridge-commerce-microservices.vercel.app)

---

## Executive Summary

EventBridge Commerce is a professional enterprise microservices messaging showcase that demonstrates how independent business services coordinate order-processing workflows through event streaming, reliable queue-based routing, retry handling, and dead letter queue processing.

The project is designed as a stakeholder-ready live architecture demo and technical portfolio project using Spring Boot Microservices Architecture, Kafka, and RabbitMQ.

---

## Project Purpose

The purpose of this project is to present a concrete, production-style reference architecture for asynchronous communication across distributed business services.

EventBridge Commerce demonstrates how order processing, payment validation, inventory reservation, shipment coordination, and notification workflows can be separated into independent services while still working together through event-driven messaging.

This project is built to support:

- Stakeholder presentations
- Technical architecture walkthroughs
- Microservices communication explanation
- Messaging and failure-handling demonstration
- GitHub and Vercel-based live project visibility

---

## Tech Stack

Spring Boot Microservices Architecture, Kafka, RabbitMQ

---

## Business Problem

Enterprise order-processing systems often become tightly coupled when payment, inventory, shipping, and notification workflows depend directly on each other.

This creates several challenges:

- Slower order processing
- Strong dependency between services
- Poor failure isolation
- Difficult scalability
- Limited visibility into distributed workflows
- Increased risk of cascading failures

EventBridge Commerce demonstrates how asynchronous communication and clear service boundaries can improve reliability, scalability, and operational control.

---

## Architecture Overview

The architecture separates business capabilities into independent microservices.

Each service owns a specific responsibility and communicates through events or messages instead of depending on tightly coupled direct calls.

### Core Services

- Order Service publishes order events.
- Payment Service reacts to order-related events and publishes payment outcomes.
- Inventory Service manages inventory reservation events.
- Shipping Service coordinates fulfillment and shipment events.
- Notification Service processes customer and operations messages.

### Messaging Responsibilities

- Kafka is used for business event streaming between services.
- RabbitMQ is used for reliable message routing, retry processing, notification delivery, and dead letter queue handling.

---

## Core Workflow Pattern

```text
Customer Order Created
        ↓
  Order Service
        ↓
Kafka Event Stream
        ↓
 Payment Service
        ↓
Inventory Service
        ↓
Shipping Service
        ↓
RabbitMQ Message Queue
        ↓
Notification Service
        ↓
Customer Notification Sent
```

### Failure Handling Flow

```text
Message Processing Failed
        ↓
  Retry Attempt 1
        ↓
  Retry Attempt 2
        ↓
  Retry Attempt 3
        ↓
 Dead Letter Queue
        ↓
 Operations Review
```

---

## Microservices Responsibilities

### 1. Order Service

Business Responsibility:  
Handles customer order intake, validates order details, manages order lifecycle status, and publishes order-created events.

Input:  
Customer order request

Output:  
order-created event

Failure Scenario:  
Invalid order details, duplicate order request, or order validation failure

---

### 2. Payment Service

Business Responsibility:  
Consumes order-created events, processes payment validation, determines payment status, and publishes payment-approved or payment-failed events.

Input:  
order-created event

Output:  
payment-approved event or payment-failed event

Failure Scenario:  
Payment declined, payment timeout, or payment processing failure

---

### 3. Inventory Service

Business Responsibility:  
Consumes payment-approved events, reserves inventory, releases inventory when downstream processing fails, and publishes inventory-reserved or inventory-rejected events.

Input:  
payment-approved event

Output:  
inventory-reserved event or inventory-rejected event

Failure Scenario:  
Item out of stock, reservation timeout, or inventory conflict

---

### 4. Shipping Service

Business Responsibility:  
Consumes inventory-reserved events, creates shipment records, updates fulfillment progress, and publishes shipment-created events.

Input:  
inventory-reserved event

Output:  
shipment-created event

Failure Scenario:  
Shipping provider unavailable, invalid address, or shipment creation failure

---

### 5. Notification Service

Business Responsibility:  
Consumes notification messages from RabbitMQ and sends customer-facing and operations-facing updates.

Input:  
notification message

Output:  
customer-notified message

Failure Scenario:  
Notification delivery failure, retry exhausted, or message sent to dead letter queue

---

## Messaging Flow

The system demonstrates two distinct communication patterns based on the type of business interaction required.

---

### A. Event Streaming Flow

```text
Order Created
        ↓
 Payment Started
        ↓
 Payment Approved
        ↓
Inventory Reserved
        ↓
Shipment Created
```

Operational Principle:  
Events represent facts that already happened. Kafka is used for event streaming when multiple services may need to react to the same business event.

---

### B. Queue-Based Message Flow

```text
Notification Requested
        ↓
RabbitMQ Message Queue
        ↓
Notification Service
        ↓
  Notification Sent
```

Operational Principle:  
Messages represent work that needs to be processed. RabbitMQ is used for reliable routing, retry handling, and task-based processing.

---

## Failure Handling Strategy

The project demonstrates a production-style failure handling strategy for distributed messaging systems.

When message processing fails, the message is routed through retry attempts. If the message continues to fail after the retry limit is reached, it is moved to a dead letter queue.

This approach helps:

- Prevent message loss
- Avoid blocking healthy consumers
- Isolate problematic workflows
- Support operations review
- Improve reliability across distributed services

---

## Failure Handling Flow

```text
Message Processing Failed
        ↓
  Retry Attempt 1
        ↓
  Retry Attempt 2
        ↓
  Retry Attempt 3
        ↓
 Dead Letter Queue
        ↓
 Operations Review
```

### Retry Mechanics

Temporary failures such as transient service timeouts or temporary delivery issues are retried before being marked as failed.

### Dead Letter Queue Handling

After repeated unsuccessful processing attempts, the failed message is moved to a dead letter queue for operational review. This prevents one bad message from blocking the rest of the workflow.

---

## Live Workflow Simulation

The portfolio website includes an interactive workflow simulator that visually demonstrates both normal processing and failure processing paths.

### Simulation Features

- Create Order Event action
- Simulate Failure action
- Reset Simulation action
- Real-time workflow progression
- Dynamic connection highlighting
- Event timeline
- Message log panel
- Broker state counters
- Retry attempt tracking
- Dead letter queue indicator
- Operational status badge

### Normal Flow Simulation

```text
order-created
        ↓
payment-approved
        ↓
inventory-reserved
        ↓
shipment-created
        ↓
notification-routed
        ↓
customer-notified
```

### Failure Flow Simulation

```text
message-processing-failed
        ↓
    retry-attempt-1
        ↓
    retry-attempt-2
        ↓
    retry-attempt-3
        ↓
  dead-letter-queue
        ↓
operations-review-required
```

---

## Stakeholder Value

EventBridge Commerce provides clear business and engineering value by demonstrating how asynchronous messaging improves enterprise workflow design.

### Key Value Points

- Faster order processing through asynchronous workflow coordination
- Better scalability because services can operate independently
- Reduced coupling between business capabilities
- Improved reliability through retry and dead letter handling
- Better operational visibility across distributed workflows
- Easier maintenance through clear service boundaries
- Safer failure management because failed messages are isolated for review

---

## Architecture Decisions

### Decision 1: Independent Service Ownership

Each service owns one business capability so changes in payment, inventory, shipping, or notification logic do not require changing the entire system.

---

### Decision 2: Event-Driven Communication

Services communicate through events so they do not need to wait for direct synchronous responses from every downstream workflow.

---

### Decision 3: Kafka for Event Streaming

Kafka is used when business events need to be published and consumed across multiple services.

---

### Decision 4: RabbitMQ for Reliable Task Routing

RabbitMQ is used when a specific task needs to be routed, retried, and tracked reliably.

---

### Decision 5: Failure Handling Through Retries and Dead Letter Queues

Temporary failures are retried, and permanently failed messages are moved to a dead letter queue for operations review.

---

## Local Run Instructions

To review the stakeholder-facing demo website locally:

```bash
git clone https://github.com/sivad5712/Eventbridge-Commerce-Microservices-Messaging.git
cd eventbridge-commerce-microservices-messaging
```

Start a local web server:

```bash
python3 -m http.server 8000
```

Open the project in your browser:

```text
http://localhost:8000
```

---

## Vercel Deployment Instructions

To host this portfolio project live on Vercel:

### 1. Initialize Git

```bash
git init
git add .
git commit -m "feat: complete enterprise architecture showcase website"
```

### 2. Push to GitHub

```bash
git remote add origin https://github.com/sivad5712/Eventbridge-Commerce-Microservices-Messaging.git
git branch -M main
git push -u origin main
```

### 3. Deploy on Vercel

1. Sign in to your Vercel dashboard.
2. Click Add New → Project.
3. Select your GitHub repository.
4. Keep the default deployment settings.
5. Click Deploy.
6. Copy the live deployment URL.
7. Add the live URL to the top of this README.
