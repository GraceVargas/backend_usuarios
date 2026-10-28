@startuml

title Diagrama de secuencia - Registro de clienta

actor Clienta as c
participant Web as w
participant "API de usuarios" as apiu
database "DB usuarios" as dbu

autoactivate on

c -> w: completar formulario de registro
w-[#blue]->apiu: POST /usuarios {nombre, apellido, email, password}
apiu-[#red]->dbu: findOne usuario {email}
dbu-->apiu: {usuario} / null

alt email ya registrado
  apiu-[#red]->w: HTTP 409 (conflict) {mensaje_error}
else email disponible
  apiu->apiu: hashPassword({password})
  apiu-->apiu: hash
  note right apiu
    hash con salt aleatorio,
    se guarda como password_hash
  end note
  apiu-[#red]->dbu: insertOne usuario {nombre, apellido, email, password_hash, rol:'cliente', activo:true}
  dbu-->apiu: {usuario}
  apiu->apiu: createJwt({usuario_id, rol:'cliente'})
  apiu-->apiu: {jwt}
  apiu-[#red]->w: HTTP 201 (created) {jwt}
end

@enduml