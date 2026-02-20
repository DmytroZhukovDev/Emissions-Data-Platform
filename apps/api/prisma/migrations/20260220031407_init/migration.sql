-- CreateTable
CREATE TABLE "sites" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "emission_limit" DECIMAL(15,4) NOT NULL,
    "total_emissions_to_date" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurements" (
    "id" UUID NOT NULL,
    "site_id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "value" DECIMAL(15,4) NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "recorded_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "measurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingest_batches" (
    "id" UUID NOT NULL,
    "site_id" UUID NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "record_count" INTEGER NOT NULL,
    "total_value" DECIMAL(15,4) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingest_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox_events" (
    "id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "aggregate_id" UUID NOT NULL,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "measurements_site_id_recorded_at_idx" ON "measurements"("site_id", "recorded_at");

-- CreateIndex
CREATE UNIQUE INDEX "ingest_batches_idempotency_key_key" ON "ingest_batches"("idempotency_key");

-- CreateIndex
CREATE INDEX "ingest_batches_site_id_idx" ON "ingest_batches"("site_id");

-- CreateIndex
CREATE INDEX "outbox_events_processed_created_at_idx" ON "outbox_events"("processed", "created_at");

-- AddForeignKey
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "ingest_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingest_batches" ADD CONSTRAINT "ingest_batches_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
