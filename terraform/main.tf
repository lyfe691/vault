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
  password      = "admin"
  url           = "http://localhost:8080"
  realm         = "master"
  base_path     = ""
}

resource "keycloak_realm" "vault" {
  realm        = "vault-core"
  enabled      = true
  display_name = "Vault Core Realm"
}

# create realm roles
resource "keycloak_role" "admin_role" {
  realm_id    = keycloak_realm.vault.id
  name        = "admin"
  description = "Administrator role"
}

resource "keycloak_role" "user_role" {
  realm_id    = keycloak_realm.vault.id
  name        = "user"
  description = "Regular user role"
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

# assign admin role to demo user
resource "keycloak_user_roles" "demo_user_roles" {
  realm_id = keycloak_realm.vault.id
  user_id  = keycloak_user.example_user.id

  role_ids = [
    keycloak_role.admin_role.id,
    keycloak_role.user_role.id,
  ]
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

# configure client scopes to include roles in the token
resource "keycloak_openid_client_scope" "realm_roles_scope" {
  realm_id               = keycloak_realm.vault.id
  name                   = "realm-roles"
  description            = "Include realm roles in the token"
  include_in_token_scope = true
}

resource "keycloak_openid_client_default_scopes" "vault_app_default_scopes" {
  realm_id  = keycloak_realm.vault.id
  client_id = keycloak_openid_client.vault_app.id
  
  default_scopes = [
    "profile",
    "email",
    "roles",
    "web-origins",
    keycloak_openid_client_scope.realm_roles_scope.name,
  ]
}
