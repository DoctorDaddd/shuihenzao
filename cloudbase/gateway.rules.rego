package authz.user

# Merge into the existing policy; keep other business rules and deny rules.
# This grants SDK invocation only, never a quest_roles administrator role.
allow if {
    input.cloudbase.resource_type == "functions"
    input.request.path == "/v1/functions/quest-api"
    input.request.method == "POST"
    input.subject.auth_type in {"anonymous", "internal", "external", "administrator"}
}

# OPA's platform defaults may allow unauthenticated traffic; deny it explicitly.
deny contains "quest-api requires authentication" if {
    input.cloudbase.resource_type == "functions"
    input.request.path == "/v1/functions/quest-api"
    input.subject.auth_type == "unauthenticated"
}
