/*
  Warnings:

  - A unique constraint covering the columns `[projectId,code]` on the table `TemplateMessage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `TemplateMessage_projectId_code_key` ON `TemplateMessage`(`projectId`, `code`);
