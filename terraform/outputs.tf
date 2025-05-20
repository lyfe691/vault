output "realm_id" {
  value = keycloak_realm.vault.id
}

output "user_id" {
  value = keycloak_user.example_user.id
}
