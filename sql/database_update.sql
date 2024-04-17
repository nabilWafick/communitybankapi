-- RENAME ALL DATABASE TABLES TO ENGLISH --
ALTER TABLE activites_economiques
RENAME TO economical_activities;

--ALTER TABLE agents RENAME TO agents;
ALTER TABLE cartes
RENAME TO cards;

ALTER TABLE categories_clients
RENAME TO categories;

ALTER TABLE charges_compte
RENAME TO collectors;

ALTER TABLE clients
RENAME TO customers;

ALTER TABLE collectes
RENAME TO collections;

ALTER TABLE comptes_clients
RENAME TO customers_accounts;

ALTER TABLE jours
RENAME TO days;

ALTER TABLE localites
RENAME TO localities;

ALTER TABLE mois
RENAME TO months;

ALTER TABLE produits
RENAME TO products;

ALTER TABLE reglements
RENAME TO settlements;

ALTER TABLE statuts_personnels
RENAME TO personal_status;

--ALTER TABLE stocks RENAME TO stocks;
ALTER TABLE transferts
RENAME TO transfers;

--ALTER TABLE types RENAME TO types;
-- RENAME ALL TABLES COLUMN TO ENGLISH --
-- agents
ALTER TABLE agents
RENAME COLUMN nom TO name;

ALTER TABLE agents
RENAME COLUMN prenoms TO firstnames;

ALTER TABLE agents
RENAME COLUMN telephone TO phone_number;

ALTER TABLE agents
RENAME COLUMN adresse TO address;

ALTER TABLE agents
RENAME COLUMN profil TO profile;

ALTER TABLE agents
RENAME COLUMN date_creation TO created_at;

ALTER TABLE agents
RENAME COLUMN date_modification TO updated_at;

-- collectors
ALTER TABLE collectors
RENAME COLUMN nom TO name;

ALTER TABLE collectors
RENAME COLUMN prenoms TO firstnames;

ALTER TABLE collectors
RENAME COLUMN telephone TO phone_number;

ALTER TABLE collectors
RENAME COLUMN adresse TO address;

ALTER TABLE collectors
RENAME COLUMN profil TO profile;

ALTER TABLE collectors
RENAME COLUMN date_creation TO created_at;

ALTER TABLE collectors
RENAME COLUMN date_modification TO updated_at;

-- customers
ALTER TABLE customers
RENAME COLUMN nom TO name;

ALTER TABLE customers
RENAME COLUMN prenoms TO firstnames;

ALTER TABLE customers
RENAME COLUMN telephone TO phone_number;

ALTER TABLE customers
RENAME COLUMN profession TO occupation;

ALTER TABLE customers
RENAME COLUMN numero_cni TO nic_number;

ALTER TABLE customers
RENAME COLUMN id_categorie TO category_id;

ALTER TABLE customers
RENAME COLUMN id_activite_economique TO economical_activity_id;

ALTER TABLE customers
RENAME COLUMN id_statut_personnel TO personal_status_id;

ALTER TABLE customers
RENAME COLUMN id_localite TO locality_id;

ALTER TABLE customers
RENAME COLUMN adresse TO address;

ALTER TABLE customers
RENAME COLUMN profil TO profile;

ALTER TABLE customers
RENAME COLUMN date_creation TO created_at;

ALTER TABLE customers
RENAME COLUMN date_modification TO updated_at;

-- collections
ALTER TABLE collections
RENAME COLUMN id_charge_compte TO collector_id;

ALTER TABLE collections
RENAME COLUMN montant TO amount;

ALTER TABLE collections
RENAME COLUMN reste TO rest;

ALTER TABLE collections
RENAME COLUMN id_agent TO agent_id;

ALTER TABLE collections
RENAME COLUMN date_collecte TO collected_at;

ALTER TABLE collections
RENAME COLUMN date_creation TO created_at;

ALTER TABLE collections
RENAME COLUMN date_modification TO updated_at;

-- customers_accounts
ALTER TABLE customers_accounts
RENAME COLUMN id_client TO customer_id;

ALTER TABLE customers_accounts
RENAME COLUMN id_charge_compte TO collector_id;

ALTER TABLE customers_accounts
RENAME COLUMN date_creation TO created_at;

ALTER TABLE customers_accounts
RENAME COLUMN date_modification TO updated_at;

-- cards
ALTER TABLE cards
RENAME COLUMN libelle TO label;

ALTER TABLE cards
RENAME COLUMN id_type TO type_id;

ALTER TABLE cards
RENAME COLUMN id_compte_client TO customer_account_id;

ALTER TABLE cards
RENAME COLUMN nombre_types TO types_number;

ALTER TABLE cards
RENAME COLUMN date_remboursement TO repaid_at;

ALTER TABLE cards
RENAME COLUMN date_satisfaction TO satisfied_at;

ALTER TABLE cards
RENAME COLUMN date_transfert TO transfered_at;

ALTER TABLE cards
RENAME COLUMN date_creation TO created_at;

ALTER TABLE cards
RENAME COLUMN date_modification TO updated_at;

-- types 
ALTER TABLE types
RENAME COLUMN nom TO name;

ALTER TABLE types
RENAME COLUMN mise TO stake;

ALTER TABLE types
RENAME COLUMN ids_produits TO products_ids;

ALTER TABLE types
RENAME COLUMN nombres_produits TO products_numbers;

ALTER TABLE types
RENAME COLUMN date_creation TO created_at;

ALTER TABLE types
RENAME COLUMN date_modification TO updated_at;

-- categories
ALTER TABLE categories
RENAME COLUMN nom TO name;

ALTER TABLE categories
RENAME COLUMN date_creation TO created_at;

ALTER TABLE categories
RENAME COLUMN date_modification TO updated_at;

-- economical_activities
ALTER TABLE economical_activities
RENAME COLUMN nom TO name;

ALTER TABLE economical_activities
RENAME COLUMN date_creation TO created_at;

ALTER TABLE economical_activities
RENAME COLUMN date_modification TO updated_at;

-- locaities
ALTER TABLE localities
RENAME COLUMN nom TO name;

ALTER TABLE localities
RENAME COLUMN date_creation TO created_at;

ALTER TABLE localities
RENAME COLUMN date_modification TO updated_at;

-- personal_status
ALTER TABLE personal_status
RENAME COLUMN nom TO name;

ALTER TABLE personal_status
RENAME COLUMN date_creation TO created_at;

ALTER TABLE personal_status
RENAME COLUMN date_modification TO updated_at;

-- days
ALTER TABLE days
RENAME COLUMN jour TO name;

ALTER TABLE days
RENAME COLUMN numero_semaine TO number;

-- modifications
ALTER TABLE modifications
RENAME COLUMN id_agent TO agent_id;

ALTER TABLE modifications
RENAME COLUMN date_creation TO created_at;

ALTER TABLE modifications
RENAME COLUMN date_modification TO updated_at;

-- months
ALTER TABLE months
RENAME COLUMN mois TO name;

ALTER TABLE months
RENAME COLUMN numero_annee TO number;

-- products
ALTER TABLE products
RENAME COLUMN nom TO name;

ALTER TABLE products
RENAME COLUMN prix_achat TO purchase_price;

ALTER TABLE products
RENAME COLUMN date_creation TO created_at;

ALTER TABLE products
RENAME COLUMN date_modification TO updated_at;

-- settlements
ALTER TABLE settlements
RENAME COLUMN nombre TO number;

ALTER TABLE settlements
RENAME COLUMN id_agent TO agent_id;

ALTER TABLE settlements
RENAME COLUMN id_carte TO card_id;

ALTER TABLE settlements
RENAME COLUMN id_collecte TO collection_id;

ALTER TABLE settlements
RENAME COLUMN est_valide TO is_validated;

ALTER TABLE settlements
RENAME COLUMN date_creation TO created_at;

ALTER TABLE settlements
RENAME COLUMN date_modification TO updated_at;

-- stocks
ALTER TABLE stocks
RENAME COLUMN quantite_initiale TO initial_quantity;

ALTER TABLE stocks
RENAME COLUMN quantite_entree TO input_quantity;

ALTER TABLE stocks
RENAME COLUMN quantite_sortie TO output_quantity;

ALTER TABLE stocks
RENAME COLUMN quantite_stock TO stock_quantity;

ALTER TABLE stocks
RENAME COLUMN id_agent TO agent_id;

ALTER TABLE stocks
RENAME COLUMN id_carte TO card_id;

ALTER TABLE stocks
RENAME COLUMN id_produit TO product_id;

ALTER TABLE stocks
RENAME COLUMN type TO movement_type;

ALTER TABLE stocks
RENAME COLUMN date_creation TO created_at;

ALTER TABLE stocks
RENAME COLUMN date_modification TO updated_at;

-- transfers
ALTER TABLE transfers
RENAME COLUMN id_carte_emettrice TO issuing_card_id;

ALTER TABLE transfers
RENAME COLUMN id_carte_receptrice TO receiving_card_id;

ALTER TABLE transfers
RENAME COLUMN id_agent TO agent_id;

ALTER TABLE transfers
RENAME COLUMN date_validation TO validated_at;

ALTER TABLE transfers
RENAME COLUMN date_rejet TO rejected_at;

ALTER TABLE transfers
RENAME COLUMN date_creation TO created_at;

ALTER TABLE transfers
RENAME COLUMN date_modification TO updated_at;

-- COPY | REPLACE customer_account_id column data
-- by customer_id in cards table 
UPDATE cards
SET
    customer_account_id = c.id
FROM
    customers_accounts ca
    JOIN customers c ON ca.customer_id = c.id
WHERE
    cards.customer_account_id = ca.id;

-- CHANGE CARDS TABLE CONSTRAINTS, 
-- UPDATE INDEX WITH CUSTOMERS ACCOUNTS TABLE TO CUSTOMERS TABLE
-- first, delete the constraint
ALTER TABLE cards
DROP CONSTRAINT IF EXISTS cartes_id_compte_client_fkey;

-- second, add a new constraint
ALTER TABLE cards ADD CONSTRAINT cartes_id_client_fkey FOREIGN KEY (customer_account_id) REFERENCES customers (id);

-- RENAME column customer_account_id to customer_id
ALTER TABLE cards
RENAME COLUMN customer_account_id TO customer_id;

-- ADD COLUMN collector_id to customers
ALTER TABLE customers
ADD COLUMN collector_id BIGINT REFERENCES collectors (id);

-- COPY CUSTOMER COLLLECTOR ID data IN collector_id
UPDATE customers
SET
    collector_id = customers_accounts.collector_id
FROM
    customers_accounts
WHERE
    customers_accounts.customer_id = customers.id;

--  ADD CONSTRAINT TO CUSTOMERS TABLE FOR COLLECTOR ON
ALTER TABLE customers ADD CONSTRAINT fk_collector_id FOREIGN KEY (collector_id) REFERENCES collectors (id);