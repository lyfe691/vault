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
  realm_id    = keycloak_realm.vault.id
  username    = "demo"
  enabled     = true
  email       = "demo@vault.local"
  first_name  = "Demo"
  last_name   = "User"
  initial_password {
    value     = "pass1234"
    temporary = false
  }
}

resource "keycloak_openid_client" "vault_app" {
  realm_id                      = keycloak_realm.vault.id
  client_id                     = "vault-app"
  name                          = "Vault Demo App"
  enabled                       = true
  standard_flow_enabled         = true
  implicit_flow_enabled         = false
  direct_access_grants_enabled = true
  service_accounts_enabled      = false
  access_type                   = "CONFIDENTIAL"
  valid_redirect_uris           = ["http://localhost:5000/callback", "http://localhost:3000/*"]
  base_url                      = "http://localhost:3000"
  client_secret                 = "vault-client-secret"
}
