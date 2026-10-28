@startuml

title Diagrama de secuencia - Login

actor web as w
participant "API de usuarios" as apiu
database "DB usuarios" as dbu

autoactivate on

== Login ==
w-[#blue]->apiu: POST /sesiones -d {email, password}
apiu-[#red]->dbu: findOne usuario {email}
dbu-->apiu: {usuario_id, activo, password_hash, rol} / null
note left apiu
  rol ∈ {'cliente', 'profesional', 'administrador'}
end note

alt usuario no existe
  apiu-[#red]->w: HTTP 401 (unauthorized) {mensaje_error}
else usuario existe
  apiu->apiu: verifyPassword({password}, {password_hash})
  apiu-->apiu: true / false
  note left apiu
    el hash tiene salt: no se puede buscar
    por hash, se compara la password
    contra el hash guardado
  end note

  alt password inválida
    apiu-[#red]->w: HTTP 401 (unauthorized) {mensaje_error}
  else password válida y activo=false
    apiu-[#red]->w: HTTP 403 (forbidden) {mensaje_error: "cuenta deshabilitada"}
  else password válida y activo=true
    apiu->apiu: createJwt({usuario_id, rol})
    apiu-->apiu: {jwt}
    apiu-[#red]->w: HTTP 200 (ok) {JWT}
  end
end

@enduml