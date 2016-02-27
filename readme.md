P2P Marketplace backend
===============

Requirements
---
mongodb, nodejs


Installation
---
```shell
git clone https://github.com/DScheglov/p2p-backend.git
cd p2p
npm install
```

Run
---
```shell
node server
```

Usage
---
1. Create an Institution that represents Financial Institution that holds
accounts and provides product servicing
2. Create an AccountFactory. AccountFactory is a template-like entity that
is used to open accounts and holds accounts sequences for different type
accounts unique for particular Institution
3. Create an Entity using one of its discriminators:
  * PrivateIndividual
  * LegalEntity
4. Open some Accounts, using openAccount -- the static method of AccountFactory
class
5. Create Transaction
6. Approve Transaction
7. Execute Transaction

Using API
---
OPTIONS http://localhost:1337/api/v1 - returns list of all allowed API
end-points with short descriptions.

TODO
---
1. Create AccountingPolicy class that represents sets of AccountFactory instances that should be used for opening accounts for Institutions, Entities and Contracts
2. Create Contract class that represents the base class for Loan, Investment etc.
3. Create Loan class
4. Create Institution method "dailySettlement", "openOperatingDate", "closeOperatingDate"
5. ...
