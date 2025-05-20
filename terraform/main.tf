terraform {
  required_providers {
    keycloak = {
      source  = "mrparkers/keycloak"
      version = "~> 4.1.0"
    }
  }
}

provider "keycloak" {
  client_id     = "admin-cli"
  username      = "admin"
  password      = "admin123"
  url           = "http://localhost:8080"
  realm         = "master"
  base_path     = ""
}

resource "keycloak_realm" "vault" {
  realm        = "vault-core"
  enabled      = true
  display_name = "Vault Core Realm"
}

resource "keycloak_user" "example_user" {
  realm_id = keycloak_realm.vault.id
  username = "demo"
  enabled  = true
  email    = "demo@vault.local"
  first_name = "Demo"
  last_name  = "User"
}
