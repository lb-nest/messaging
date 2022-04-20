-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('Telegram', 'Whatsapp');

-- CreateEnum
CREATE TYPE "ChannelStatus" AS ENUM ('Connected', 'Connecting', 'Error');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('Accepted', 'Delivered', 'Read', 'Error');

-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('Audio', 'Document', 'Image', 'Video');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('Requested', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "WebhookEventType" AS ENUM ('IncomingChats', 'OutgoingChats', 'IncomingMessages', 'OutgoingMessages', 'All');

-- CreateTable
CREATE TABLE "Channel" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ChannelType" NOT NULL,
    "status" "ChannelStatus" NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "chatId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("chatId")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "channelId" INTEGER NOT NULL,
    "accountId" TEXT NOT NULL,
    "isNew" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "chatId" INTEGER NOT NULL,
    "fromMe" BOOLEAN NOT NULL,
    "status" "MessageStatus" NOT NULL,
    "externalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Content" (
    "id" SERIAL NOT NULL,
    "messageId" INTEGER NOT NULL,
    "text" TEXT,
    "buttons" JSONB,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" SERIAL NOT NULL,
    "contentId" INTEGER NOT NULL,
    "type" "AttachmentType" NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateMessage" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "buttons" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "channelId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "status" "ApprovalStatus" NOT NULL,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("channelId","templateId")
);

-- CreateTable
CREATE TABLE "Webhook" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "eventType" "WebhookEventType" NOT NULL,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Channel_projectId_id_key" ON "Channel"("projectId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_channelId_accountId_key" ON "Chat"("channelId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Message_externalId_key" ON "Message"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateMessage_projectId_id_key" ON "TemplateMessage"("projectId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateMessage_projectId_code_key" ON "TemplateMessage"("projectId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Webhook_projectId_id_key" ON "Webhook"("projectId", "id");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TemplateMessage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
