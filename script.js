/*
========================================================================
EventBridge Commerce: Enterprise Microservices Messaging Platform
Core Simulation Logic & Interactivity (3D Apple-Style Design Edition)
========================================================================
*/

document.addEventListener('DOMContentLoaded', () => {
    
    // -----------------------------------------------------------------
    // Part 1: Apple-Style 3D Scroll-Reveal (Intersection Observer)
    // -----------------------------------------------------------------
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.08
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Trigger only once
            }
        });
    }, observerOptions);

    // Apply reveal class dynamically to all non-hero sections
    document.querySelectorAll('section').forEach(section => {
        if (section.id !== 'hero') {
            section.classList.add('reveal');
            revealObserver.observe(section);
        }
    });

    // -----------------------------------------------------------------
    // Part 2: Interactive 3D Cursor Card-Tilt Effect
    // -----------------------------------------------------------------
    const tiltCards = document.querySelectorAll('.tech-card, .resp-card, .benefit-card, .bullets-card, .diag-detail-card, .timeline-content');
    
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within card
            const y = e.clientY - rect.top;  // y position within card
            
            const xc = rect.width / 2;
            const yc = rect.height / 2;
            
            // Calculate tilt angle: max ~8 degrees
            const angleX = ((yc - y) / yc) * 8;
            const angleY = ((x - xc) / xc) * 8;
            
            card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.02, 1.02, 1.02)`;
            card.style.boxShadow = `0 20px 40px rgba(0,0,0,0.5), 0 0 25px rgba(56, 189, 248, 0.08)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.boxShadow = ``;
        });
    });

    // -----------------------------------------------------------------
    // Part 3: Navigation smooth scrolling
    // -----------------------------------------------------------------
    document.querySelectorAll('header nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                window.scrollTo({
                    top: targetEl.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // -----------------------------------------------------------------
    // Part 4: SVG Path Dynamic Updater (Responsive Layout)
    // -----------------------------------------------------------------
    const svg = document.getElementById('sim-svg');
    
    function getCenter(elId) {
        const el = document.getElementById(elId);
        if (!el || !svg) return { x: 0, y: 0 };
        const elRect = el.getBoundingClientRect();
        const svgRect = svg.getBoundingClientRect();
        return {
            x: (elRect.left + elRect.right) / 2 - svgRect.left,
            y: (elRect.top + elRect.bottom) / 2 - svgRect.top
        };
    }

    function updatePaths() {
        if (!svg) return;

        const drawCurve = (pathId, fromId, toId) => {
            const path = document.getElementById(pathId);
            if (!path) return;
            const from = getCenter(fromId);
            const to = getCenter(toId);

            if (Math.abs(from.y - to.y) > 40) {
                const midY = (from.y + to.y) / 2;
                if (to.x < from.x) {
                    // Curved wrap connection right-to-left
                    path.setAttribute('d', `M ${from.x} ${from.y} C ${from.x + 100} ${from.y}, ${to.x - 100} ${to.y}, ${to.x} ${to.y}`);
                } else {
                    path.setAttribute('d', `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`);
                }
            } else {
                path.setAttribute('d', `M ${from.x} ${from.y} L ${to.x} ${to.y}`);
            }
        };

        // Draw connections dynamically
        drawCurve('sim-path-order-kafka', 'sim-node-order', 'sim-node-kafka');
        drawCurve('sim-path-kafka-payment', 'sim-node-kafka', 'sim-node-payment');
        drawCurve('sim-path-payment-inventory', 'sim-node-payment', 'sim-node-inventory');
        drawCurve('sim-path-inventory-shipping', 'sim-node-inventory', 'sim-node-shipping');
        drawCurve('sim-path-shipping-rabbitmq', 'sim-node-shipping', 'sim-node-rabbitmq');
        drawCurve('sim-path-rabbitmq-notif', 'sim-node-rabbitmq', 'sim-node-notification');
        drawCurve('sim-path-notif-retry', 'sim-node-notification', 'sim-node-retry');
        drawCurve('sim-path-retry-dlq', 'sim-node-retry', 'sim-node-dlq');
    }

    updatePaths();
    window.addEventListener('resize', updatePaths);
    window.addEventListener('scroll', updatePaths);

    // -----------------------------------------------------------------
    // Part 5: Enhanced SVG Dynamic Text Packet Animation Helper
    // -----------------------------------------------------------------
    function animatePacket(fromId, toId, textContent, duration = 850) {
        return new Promise((resolve) => {
            const packetGroup = document.getElementById('sim-packet-group');
            const packetRect = packetGroup.querySelector('rect');
            const packetText = packetGroup.querySelector('text');
            
            if (!packetGroup || !packetRect || !packetText) {
                resolve();
                return;
            }

            // Dynamically size the text packet capsule
            packetText.textContent = textContent;
            const textWidth = textContent.length * 7.5 + 24;
            packetRect.setAttribute('width', textWidth);
            packetRect.setAttribute('x', -textWidth / 2);

            const from = getCenter(fromId);
            const to = getCenter(toId);

            packetGroup.setAttribute('transform', `translate(${from.x}, ${from.y})`);
            packetGroup.style.display = 'block';

            let startTime = null;

            function step(timestamp) {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Quad ease-in-out movement
                const easeProgress = progress < 0.5 
                    ? 2 * progress * progress 
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                let x, y;
                if (Math.abs(from.y - to.y) > 40) {
                    const midY = (from.y + to.y) / 2;
                    const cp1x = to.x < from.x ? from.x + 100 : from.x;
                    const cp1y = to.x < from.x ? from.y : midY;
                    const cp2x = to.x < from.x ? to.x - 100 : to.x;
                    const cp2y = to.x < from.x ? to.y : midY;

                    const t = easeProgress;
                    x = Math.pow(1-t, 3) * from.x + 3 * Math.pow(1-t, 2) * t * cp1x + 3 * (1-t) * Math.pow(t, 2) * cp2x + Math.pow(t, 3) * to.x;
                    y = Math.pow(1-t, 3) * from.y + 3 * Math.pow(1-t, 2) * t * cp1y + 3 * (1-t) * Math.pow(t, 2) * cp2y + Math.pow(t, 3) * to.y;
                } else {
                    x = from.x + (to.x - from.x) * easeProgress;
                    y = from.y + (to.y - from.y) * easeProgress;
                }

                packetGroup.setAttribute('transform', `translate(${x}, ${y})`);

                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    packetGroup.style.display = 'none';
                    resolve();
                }
            }

            requestAnimationFrame(step);
        });
    }

    // -----------------------------------------------------------------
    // Part 6: Interactive Simulation State Engine
    // -----------------------------------------------------------------
    const btnCreateOrder = document.getElementById('btn-create-order');
    const btnSimulateFail = document.getElementById('btn-simulate-fail');
    const btnResetSim = document.getElementById('btn-reset-sim');
    
    // Speed control elements
    const speedButtons = document.querySelectorAll('.speed-btn');
    let simulationSpeed = 1.0; 

    speedButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            speedButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            simulationSpeed = parseFloat(btn.getAttribute('data-speed'));
        });
    });
    
    const simStatusContainer = document.getElementById('sim-status');
    const statusText = simStatusContainer.querySelector('.status-badge');
    
    // Stepper elements
    const stepNodes = document.querySelectorAll('.step-node');
    const stepperLineFill = document.getElementById('stepper-progress');

    // Broker log panels
    const kafkaPartitionLog = document.getElementById('kafka-partition-log');
    const rabbitmqQueueSlot = document.getElementById('rabbitmq-queue-slot');
    const queueEmptyLabel = document.getElementById('queue-empty-label');
    
    // Broker metric numbers
    const statKafka = document.getElementById('stat-kafka');
    const statRabbitmq = document.getElementById('stat-rabbitmq');
    const statRetryCount = document.getElementById('stat-retry-count');
    const statDlqCount = document.getElementById('stat-dlq-count');
    
    const consoleLogs = document.getElementById('console-logs');

    let isRunning = false;
    let currentRetryAttempts = 0;
    let dlqMailboxSize = 0;
    let kafkaOffsetCounter = 100;

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms / simulationSpeed));

    function getFormattedTime() {
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        return `[${hrs}:${mins}:${secs}]`;
    }

    function logMessage(sender, message, type = 'system') {
        const line = document.createElement('div');
        line.className = 'console-line';
        
        const timestampSpan = document.createElement('span');
        timestampSpan.className = 'console-timestamp';
        timestampSpan.textContent = getFormattedTime();
        
        const textSpan = document.createElement('span');
        textSpan.className = `console-text ${type}`;
        textSpan.textContent = `[${sender}] ${message}`;
        
        line.appendChild(timestampSpan);
        line.appendChild(textSpan);
        consoleLogs.appendChild(line);
        consoleLogs.scrollTop = consoleLogs.scrollHeight;
    }

    function clearVisualizationStates() {
        document.querySelectorAll('.sim-node').forEach(node => {
            // Keep basic node name but strip state descriptors
            node.className = node.id === 'sim-node-kafka' ? 'sim-node kafka-node' : (node.id === 'sim-node-rabbitmq' ? 'sim-node rabbitmq-node' : 'sim-node');
        });
        document.querySelectorAll('.sim-path').forEach(path => {
            path.classList.remove('active-path', 'active-path-kafka', 'active-path-rabbitmq', 'active-path-failure');
        });
    }

    function resetStepper() {
        stepNodes.forEach(node => {
            node.className = 'step-node';
        });
        stepperLineFill.style.width = '0%';
    }

    function updateStepper(stepIndex, status = 'active') {
        resetStepper();
        const widths = ['0%', '33.3%', '66.6%', '100%'];
        stepperLineFill.style.width = widths[stepIndex];

        for (let i = 0; i <= stepIndex; i++) {
            const node = document.getElementById(`step-${i}`);
            if (node) {
                if (i < stepIndex) {
                    node.classList.add('completed');
                } else {
                    node.classList.add(status);
                }
            }
        }
    }

    function updateStatusUI(badgeClass, text) {
        simStatusContainer.className = 'sim-status-indicator';
        statusText.className = 'status-badge';
        statusText.classList.add(badgeClass);
        statusText.textContent = text;
    }

    function appendKafkaCommit(partitionIndex, payloadName) {
        kafkaOffsetCounter++;
        const col = document.getElementById(`part-${partitionIndex}`);
        if (!col) return;

        const record = document.createElement('div');
        record.className = 'offset-record';
        record.textContent = `o:${kafkaOffsetCounter} ${payloadName}`;

        col.appendChild(record);

        const children = col.querySelectorAll('.offset-record');
        if (children.length > 4) {
            children[0].remove();
        }
    }

    function enqueueRabbitMessage(messageLabel) {
        if (queueEmptyLabel) queueEmptyLabel.style.display = 'none';

        const card = document.createElement('div');
        card.className = 'queue-card';
        card.id = 'temp-rabbit-card';
        card.innerHTML = `✉️ ${messageLabel}`;

        rabbitmqQueueSlot.appendChild(card);
    }

    function dequeueRabbitMessage() {
        const card = document.getElementById('temp-rabbit-card');
        if (card) {
            card.style.transform = 'translateX(50px)';
            card.style.opacity = '0';
            setTimeout(() => {
                card.remove();
                if (rabbitmqQueueSlot.children.length === 0 || 
                    (rabbitmqQueueSlot.children.length === 1 && rabbitmqQueueSlot.children[0] === queueEmptyLabel)) {
                    if (queueEmptyLabel) queueEmptyLabel.style.display = 'block';
                }
            }, 300);
        }
    }

    function resetSimulation() {
        if (isRunning) return;
        currentRetryAttempts = 0;
        clearVisualizationStates();
        resetStepper();
        updateStatusUI('status-healthy', 'Healthy');
        
        statKafka.textContent = 'Idle';
        statKafka.className = 'sim-stat-val';
        
        statRabbitmq.textContent = '0 msgs';
        statRabbitmq.className = 'sim-stat-val';
        
        statRetryCount.textContent = '0 / 3';
        statRetryCount.className = 'sim-stat-val';
        
        statDlqCount.textContent = `${dlqMailboxSize} msgs`;
        if (dlqMailboxSize > 0) {
            statDlqCount.classList.add('error');
        } else {
            statDlqCount.className = 'sim-stat-val';
        }

        document.querySelectorAll('.offset-record').forEach(el => el.remove());
        dequeueRabbitMessage();
        if (queueEmptyLabel) queueEmptyLabel.style.display = 'block';

        consoleLogs.innerHTML = '';
        logMessage('System', 'Simulation state reset. Awaiting user interaction...', 'system');
        updatePaths();
    }

    btnResetSim.addEventListener('click', resetSimulation);

    // Workflow A: Normal Flow Sequence
    async function runNormalFlow() {
        if (isRunning) return;
        isRunning = true;
        
        btnCreateOrder.disabled = true;
        btnSimulateFail.disabled = true;
        btnResetSim.disabled = true;
        
        clearVisualizationStates();
        updateStepper(0, 'active');
        updateStatusUI('status-processing', 'Processing');
        logMessage('Order Ingest', 'Transactional Order request received: { items: 3, user: "cust_901" }', 'system');

        // Step 1: Order Service Validates & Publishes Event
        const nodeOrder = document.getElementById('sim-node-order');
        nodeOrder.classList.add('active');
        await sleep(600);
        
        logMessage('Order Service', 'Validated Order #EB-8924. Saving state as PENDING.', 'system');
        logMessage('Order Service', "Publishing event 'order-created' to Kafka topic 'order-events'.", 'system');
        
        // Animate packet to Kafka
        const pathOrderKafka = document.getElementById('sim-path-order-kafka');
        pathOrderKafka.classList.add('active-path');
        updateStepper(1, 'active');
        
        await animatePacket('sim-node-order', 'sim-node-kafka', 'order-created', 800 / simulationSpeed);
        
        // Highlight Kafka
        const nodeKafka = document.getElementById('sim-node-kafka');
        nodeKafka.classList.add('active');
        statKafka.textContent = 'Topic: order-events (1 pending)';
        statKafka.classList.add('healthy');
        appendKafkaCommit(0, 'order-created');
        logMessage('Kafka Broker', "Event 'order-created' appended to Partition 0 Offset 142.", 'success');
        await sleep(800);

        // Step 2: Payment Service Consumes & Processes Payment
        logMessage('Payment Service', "Consumed event 'order-created' from Kafka. Invoking Payment Gateway.", 'system');
        pathOrderKafka.classList.remove('active-path');
        const pathKafkaPayment = document.getElementById('sim-path-kafka-payment');
        pathKafkaPayment.classList.add('active-path-kafka');
        
        await animatePacket('sim-node-kafka', 'sim-node-payment', 'order-created', 800 / simulationSpeed);
        
        const nodePayment = document.getElementById('sim-node-payment');
        nodePayment.classList.add('active');
        logMessage('Payment Service', 'Transaction authorized successfully. Transaction ID: txn_44921.', 'success');
        await sleep(600);
        
        logMessage('Payment Service', "Publishing event 'payment-approved' to Kafka topic 'payment-events'.", 'system');
        appendKafkaCommit(1, 'payment-approved');
        
        // Route to Inventory Service (wrap connection)
        pathKafkaPayment.classList.remove('active-path-kafka');
        const pathPaymentInventory = document.getElementById('sim-path-payment-inventory');
        pathPaymentInventory.classList.add('active-path');
        
        await animatePacket('sim-node-payment', 'sim-node-inventory', 'payment-approved', 1100 / simulationSpeed);
        
        // Step 3: Inventory Service Reserve Items
        const nodeInventory = document.getElementById('sim-node-inventory');
        nodeInventory.classList.add('active');
        logMessage('Inventory Service', "Consumed event 'payment-approved' from Kafka. Checking allocation.", 'system');
        await sleep(500);
        logMessage('Inventory Service', 'Reserved 3 items in warehouse Segment A-12. Stock locked.', 'success');
        
        logMessage('Inventory Service', "Publishing event 'inventory-reserved' to Kafka topic 'inventory-events'.", 'system');
        appendKafkaCommit(2, 'inventory-reserved');
        
        // Route to Shipping Service
        pathPaymentInventory.classList.remove('active-path');
        const pathInventoryShipping = document.getElementById('sim-path-inventory-shipping');
        pathInventoryShipping.classList.add('active-path');
        
        await animatePacket('sim-node-inventory', 'sim-node-shipping', 'inventory-reserved', 800 / simulationSpeed);

        // Step 4: Shipping Service Compiles Manifest
        const nodeShipping = document.getElementById('sim-node-shipping');
        nodeShipping.classList.add('active');
        logMessage('Shipping Service', "Consumed event 'inventory-reserved'. Preparing courier request.", 'system');
        await sleep(600);
        logMessage('Shipping Service', 'Waybill generated. Tracking ID: TRK-9812401. Courier notified.', 'success');
        
        logMessage('Shipping Service', "Dispatching customer notification command task to RabbitMQ.", 'system');
        updateStepper(2, 'active');

        // Route to RabbitMQ
        pathInventoryShipping.classList.remove('active-path');
        const pathShippingRabbitmq = document.getElementById('sim-path-shipping-rabbitmq');
        pathShippingRabbitmq.classList.add('active-path-rabbitmq');
        
        await animatePacket('sim-node-shipping', 'sim-node-rabbitmq', 'notification-task', 800 / simulationSpeed);

        // Highlight RabbitMQ
        const nodeRabbit = document.getElementById('sim-node-rabbitmq');
        nodeRabbit.classList.add('active');
        statRabbitmq.textContent = '1 message';
        statRabbitmq.classList.add('warning');
        enqueueRabbitMessage('Notify Cust');
        
        statKafka.textContent = 'Idle';
        statKafka.classList.remove('healthy');
        logMessage('RabbitMQ Broker', "Enqueued routing task to queue 'q.notification-dispatch'.", 'success');
        await sleep(800);

        // Route to Notification Service
        pathShippingRabbitmq.classList.remove('active-path-rabbitmq');
        const pathRabbitNotif = document.getElementById('sim-path-rabbitmq-notif');
        pathRabbitNotif.classList.add('active-path-rabbitmq');
        updateStepper(3, 'active');
        
        await animatePacket('sim-node-rabbitmq', 'sim-node-notification', 'Notify Cust', 1100 / simulationSpeed);

        // Step 5: Notification Service Consumes Task & Alerts Customer
        const nodeNotif = document.getElementById('sim-node-notification');
        nodeNotif.classList.add('success-state');
        logMessage('Notification Service', "Consumed task command from RabbitMQ queue 'q.notification-dispatch'.", 'system');
        await sleep(500);
        logMessage('Notification Service', 'Dispatched SMS confirmation to customer mobile: +1 (555) ***-8924.', 'success');
        logMessage('Notification Service', 'Dispatched Email confirmation receipt to customer inbox.', 'success');
        logMessage('Notification Service', 'Acknowledging message delivery completion back to RabbitMQ.', 'success');
        
        statRabbitmq.textContent = '0 msgs';
        statRabbitmq.className = 'sim-stat-val';
        dequeueRabbitMessage();
        await sleep(400);

        // Conclude
        clearVisualizationStates();
        nodeOrder.classList.add('success-state');
        nodePayment.classList.add('success-state');
        nodeInventory.classList.add('success-state');
        nodeShipping.classList.add('success-state');
        nodeNotif.classList.add('success-state');
        
        updateStepper(3, 'completed');
        updateStatusUI('status-completed', 'Completed');
        logMessage('Workflow Orchestrator', 'Order process workflow completed successfully.', 'success');
        
        btnCreateOrder.disabled = false;
        btnSimulateFail.disabled = false;
        btnResetSim.disabled = false;
        isRunning = false;
    }

    btnCreateOrder.addEventListener('click', runNormalFlow);

    // Workflow B: Failure and DLQ Redirection Sequence
    async function runFailureFlow() {
        if (isRunning) return;
        isRunning = true;
        
        btnCreateOrder.disabled = true;
        btnSimulateFail.disabled = true;
        btnResetSim.disabled = true;
        
        clearVisualizationStates();
        updateStepper(0, 'active');
        updateStatusUI('status-processing', 'Processing');
        logMessage('Order Ingest', 'Simulating transactional failure flow...', 'warning');

        // Quickly traverse Order -> Kafka -> Payment -> Inventory -> Shipping -> RabbitMQ
        const nodeOrder = document.getElementById('sim-node-order');
        nodeOrder.classList.add('active');
        await sleep(300);
        logMessage('Order Service', 'Order EB-9042 received. Publishing event.', 'system');
        
        updateStepper(1, 'active');
        await animatePacket('sim-node-order', 'sim-node-kafka', 'order-created', 450 / simulationSpeed);
        const nodeKafka = document.getElementById('sim-node-kafka');
        nodeKafka.classList.add('active');
        appendKafkaCommit(0, 'order-created');
        await sleep(300);
        
        await animatePacket('sim-node-kafka', 'sim-node-payment', 'order-created', 450 / simulationSpeed);
        const nodePayment = document.getElementById('sim-node-payment');
        nodePayment.classList.add('active');
        logMessage('Payment Service', 'Payment authorized.', 'success');
        appendKafkaCommit(1, 'payment-approved');
        await sleep(300);
        
        await animatePacket('sim-node-payment', 'sim-node-inventory', 'payment-approved', 600 / simulationSpeed);
        const nodeInventory = document.getElementById('sim-node-inventory');
        nodeInventory.classList.add('active');
        logMessage('Inventory Service', 'Stock reserved.', 'success');
        appendKafkaCommit(2, 'inventory-reserved');
        await sleep(300);
        
        await animatePacket('sim-node-inventory', 'sim-node-shipping', 'inventory-reserved', 450 / simulationSpeed);
        const nodeShipping = document.getElementById('sim-node-shipping');
        nodeShipping.classList.add('active');
        logMessage('Shipping Service', 'Manifest generated. Dispatched job to RabbitMQ.', 'system');
        await sleep(300);
        
        updateStepper(2, 'active');
        await animatePacket('sim-node-inventory', 'sim-node-rabbitmq', 'notification-task', 450 / simulationSpeed);
        const nodeRabbit = document.getElementById('sim-node-rabbitmq');
        nodeRabbit.classList.add('active');
        statRabbitmq.textContent = '1 message';
        statRabbitmq.classList.add('warning');
        enqueueRabbitMessage('Notify Cust');
        await sleep(400);

        // RabbitMQ to Notification Service
        updateStepper(3, 'active');
        await animatePacket('sim-node-rabbitmq', 'sim-node-notification', 'Notify Cust', 600 / simulationSpeed);
        const nodeNotif = document.getElementById('sim-node-notification');
        nodeNotif.classList.add('active');
        logMessage('Notification Service', 'Processing dispatched message...', 'system');
        await sleep(600);

        // Trigger Failure
        nodeNotif.classList.remove('active');
        nodeNotif.classList.add('error-state');
        logMessage('Notification Service', 'Connection exception: SMTP mail host [smtp.mailprovider.net:587] could not be reached.', 'error');
        logMessage('Notification Service', 'Processing execution failed. Refusing task message acknowledgment.', 'error');
        await sleep(800);

        // Enter Retry 1
        updateStatusUI('status-retrying', 'Retrying');
        currentRetryAttempts = 1;
        statRetryCount.textContent = `${currentRetryAttempts} / 3`;
        statRetryCount.classList.add('warning');
        
        const pathNotifRetry = document.getElementById('sim-path-notif-retry');
        pathNotifRetry.classList.add('active-path-failure');
        await animatePacket('sim-node-notification', 'sim-node-retry', 'retry-attempt-1', 700 / simulationSpeed);
        
        const nodeRetry = document.getElementById('sim-node-retry');
        nodeRetry.classList.add('warning-state');
        logMessage('RabbitMQ Broker', 'Message routing returned with failure. Invoking Retry backoff rules.', 'warning');
        logMessage('RabbitMQ Broker', 'Retry attempt 1 of 3 initiated. Re-queuing with 1000ms delay...', 'warning');
        await sleep(1200);

        // Retry 2
        currentRetryAttempts = 2;
        statRetryCount.textContent = `${currentRetryAttempts} / 3`;
        nodeRetry.classList.remove('warning-state');
        await sleep(200);
        nodeRetry.classList.add('warning-state');
        logMessage('Notification Service', 'SMTP gateway connection attempt 2 timed out. Service unavailable.', 'error');
        logMessage('RabbitMQ Broker', 'Retry attempt 2 of 3 initiated. Re-queuing with 2000ms delay...', 'warning');
        await sleep(1200);

        // Retry 3
        currentRetryAttempts = 3;
        statRetryCount.textContent = `${currentRetryAttempts} / 3`;
        nodeRetry.classList.remove('warning-state');
        await sleep(200);
        nodeRetry.classList.add('warning-state');
        logMessage('Notification Service', 'SMTP gateway connection attempt 3 timed out. Connection refused.', 'error');
        logMessage('RabbitMQ Broker', 'Retry attempt 3 of 3 initiated. Re-queuing with 4000ms delay...', 'warning');
        await sleep(1200);

        // Exhausted Retries -> DLQ Redirection
        logMessage('Notification Service', 'All retry efforts (3/3) exhausted. Rejecting payload permanently.', 'error');
        await sleep(600);
        
        pathNotifRetry.classList.remove('active-path-failure');
        const pathRetryDlq = document.getElementById('sim-path-retry-dlq');
        pathRetryDlq.classList.add('active-path-failure');
        
        await animatePacket('sim-node-retry', 'sim-node-dlq', 'poison-payload', 700 / simulationSpeed);

        // Highlight DLQ
        nodeRetry.classList.remove('warning-state');
        const nodeDlq = document.getElementById('sim-node-dlq');
        nodeDlq.classList.add('error-state');
        
        dlqMailboxSize += 1;
        statDlqCount.textContent = `${dlqMailboxSize} msgs`;
        statDlqCount.classList.add('error');
        statRabbitmq.textContent = '0 msgs';
        statRabbitmq.className = 'sim-stat-val';
        statRetryCount.textContent = '0 / 3';
        statRetryCount.className = 'sim-stat-val';
        
        dequeueRabbitMessage();
        
        logMessage('RabbitMQ Broker', "Redirecting poison message to dead-letter exchange 'x.dlq' -> queue 'q.dlq.notifications'.", 'error');
        logMessage('Operations Monitor', 'Dead Letter Alert: Mailbox q.dlq.notifications has received a failed task payload. Operations review required!', 'error');
        
        updateStatusUI('status-review', 'Needs Review');
        updateStepper(3, 'failed');
        
        pathRetryDlq.classList.remove('active-path-failure');

        btnCreateOrder.disabled = false;
        btnSimulateFail.disabled = false;
        btnResetSim.disabled = false;
        isRunning = false;
    }

    btnSimulateFail.addEventListener('click', runFailureFlow);

});
