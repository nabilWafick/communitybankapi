-- CreateTable
CREATE TABLE "agents" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "firstnames" TEXT NOT NULL,
    "phone_number" VARCHAR,
    "address" TEXT,
    "profile" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),
    "email" TEXT NOT NULL,
    "permissions" JSONB NOT NULL,
    "views" JSONB NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "type_id" INTEGER NOT NULL,
    "satisfied_at" TIMESTAMPTZ(6),
    "repaid_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),
    "customer_id" INTEGER NOT NULL,
    "types_number" INTEGER NOT NULL DEFAULT 1,
    "transfered_at" TIMESTAMPTZ(6),

    CONSTRAINT "cartes_pkey1" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),

    CONSTRAINT "categories_client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" SERIAL NOT NULL,
    "collector_id" INTEGER NOT NULL,
    "amount" DECIMAL NOT NULL,
    "rest" DECIMAL NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "collected_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),

    CONSTRAINT "collecte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collectors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "firstnames" TEXT NOT NULL,
    "phone_number" VARCHAR NOT NULL,
    "address" VARCHAR NOT NULL,
    "profile" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),

    CONSTRAINT "charges_comptes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "firstnames" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "occupation" TEXT,
    "nic_number" INTEGER,
    "category_id" INTEGER,
    "economical_activity_id" INTEGER,
    "personal_status_id" INTEGER,
    "locality_id" INTEGER,
    "profile" TEXT,
    "signature" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),
    "collector_id" INTEGER,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "days" (
    "id" SERIAL NOT NULL,
    "day" TEXT NOT NULL,
    "number" SMALLINT NOT NULL,

    CONSTRAINT "jours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "economical_activities" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),

    CONSTRAINT "activites_economiques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "localities" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),

    CONSTRAINT "loacalites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modifications" (
    "id" SERIAL NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "modification" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),

    CONSTRAINT "modifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "months" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "number" SMALLINT NOT NULL,

    CONSTRAINT "mois_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_status" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),

    CONSTRAINT "statuts_personnels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "purchase_price" DECIMAL NOT NULL,
    "photo" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),

    CONSTRAINT "produits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settlements" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),
    "card_id" INTEGER NOT NULL,
    "collection_id" INTEGER,
    "is_validated" BOOLEAN NOT NULL,

    CONSTRAINT "reglements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stocks" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "initial_quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),
    "input_quantity" INTEGER,
    "output_quantity" INTEGER,
    "stock_quantity" INTEGER NOT NULL,
    "movement_type" VARCHAR,
    "card_id" INTEGER,
    "agent_id" INTEGER NOT NULL,

    CONSTRAINT "stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfers" (
    "id" SERIAL NOT NULL,
    "issuing_card_id" INTEGER NOT NULL,
    "receiving_card_id" INTEGER NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "validated_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),
    "rejected_at" TIMESTAMPTZ(6),

    CONSTRAINT "transferts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "stake" DECIMAL NOT NULL,
    "products_ids" INTEGER[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),
    "products_numbers" INTEGER[],

    CONSTRAINT "types_pkey1" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "password" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "security_questions" JSONB NOT NULL,
    "last_login_at" TIMESTAMPTZ(6),
    "password_reseted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc-1'::text),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agents_id_key" ON "agents"("id");

-- CreateIndex
CREATE UNIQUE INDEX "agents_telephone_key" ON "agents"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "agents_email_key" ON "agents"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cartes_id_key" ON "cards"("id");

-- CreateIndex
CREATE UNIQUE INDEX "cartes_libelle_key" ON "cards"("label");

-- CreateIndex
CREATE UNIQUE INDEX "categories_clients_nom_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "collecte_id_key" ON "collections"("id");

-- CreateIndex
CREATE UNIQUE INDEX "charges_compte_telephone_key" ON "collectors"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "jours_id_key" ON "days"("id");

-- CreateIndex
CREATE UNIQUE INDEX "jours_numero_semaine_key" ON "days"("number");

-- CreateIndex
CREATE UNIQUE INDEX "activites_economiques_id_key" ON "economical_activities"("id");

-- CreateIndex
CREATE UNIQUE INDEX "activites_economiques_nom_key" ON "economical_activities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "localites_id_key" ON "localities"("id");

-- CreateIndex
CREATE UNIQUE INDEX "localites_nom_key" ON "localities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "mois_id_key" ON "months"("id");

-- CreateIndex
CREATE UNIQUE INDEX "mois_numero_annee_key" ON "months"("number");

-- CreateIndex
CREATE UNIQUE INDEX "statuts_personnels_nom_key" ON "personal_status"("name");

-- CreateIndex
CREATE UNIQUE INDEX "produits_nom_key" ON "products"("name");

-- CreateIndex
CREATE UNIQUE INDEX "transferts_id_key" ON "transfers"("id");

-- CreateIndex
CREATE UNIQUE INDEX "types_nom_key" ON "types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_agent_id_key" ON "users"("agent_id");

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cartes_id_client_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cartes_id_type_fkey" FOREIGN KEY ("type_id") REFERENCES "types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collectes_id_agent_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collectes_id_charge_compte_fkey" FOREIGN KEY ("collector_id") REFERENCES "collectors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "clients_id_activite_economique_fkey" FOREIGN KEY ("economical_activity_id") REFERENCES "economical_activities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "clients_id_categorie_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "clients_id_localite_fkey" FOREIGN KEY ("locality_id") REFERENCES "localities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "clients_id_statut_personnel_fkey" FOREIGN KEY ("personal_status_id") REFERENCES "personal_status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_collector_id_fkey" FOREIGN KEY ("collector_id") REFERENCES "collectors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "modifications" ADD CONSTRAINT "public_modifications_id_agent_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "reglements_id_agent_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "reglements_id_carte_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "reglements_id_collecte_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stocks" ADD CONSTRAINT "public_stock_id_agent_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stocks" ADD CONSTRAINT "public_stock_id_carte_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stocks" ADD CONSTRAINT "public_stock_id_produit_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "public_transferts_id_agent_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "public_transferts_id_carte_emettrice_fkey" FOREIGN KEY ("issuing_card_id") REFERENCES "cards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "public_transferts_id_carte_receptrice_fkey" FOREIGN KEY ("receiving_card_id") REFERENCES "cards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

