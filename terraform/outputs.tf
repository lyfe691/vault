output "realm_id" {
  value = keycloak_realm.vault.id
}

output "user_id" {
  value = keycloak_user.example_user.id
}

output "client_secret" {
  value     = keycloak_openid_client.vault_app.client_secret
  sensitive = true
}

output "test_user" {
  value = keycloak_user.example_user.username
}
