import amqp, { Channel } from "amqplib";

let channel: Channel | null = null;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel();

    const queue = "household_queue";

    await channel.assertQueue(queue, { durable: true });

    console.log("[RabbitMq] Connected and queue is set up");
  } catch (error) {
    console.error("[RabbitMQ] Failed to connect", error);
  }
};

export const sendMessage = async (message: string) => {
  if (channel) {
    const queue = "household_queue";
    channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
    console.log("[RabbitMQ] Message sent", message);
  } else {
    console.error("[RabbitMQ] Channel not initialized");
  }
};
