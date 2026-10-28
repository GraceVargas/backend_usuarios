@startuml

title Diagrama de secuencia - Alta de profesional (la realiza un administrador)

actor Administrador as a
participant Web as w
participant "API de usuarios" as apiu
database "DB usuarios" as dbu

autoactivate on

a -> w: completar alta de profesional {nombre, apellido, email}
w-[#blue]->apiu: POST /admin/usuarios -h Authorization: {JWT admin} {nombre, apellido, email, rol}
apiu->apiu: verificarJWT({JWT admin})
apiu-->apiu: {usuario_id, rol} / error
note right apiu
  decodifica, valida firma
  y expiración localmente
end note

alt JWT inválido
  apiu-[#red]->w: HTTP 401 (unauthorized) {mensaje_error}
else rol del JWT != 'administrador'
  apiu-[#red]->w: HTTP 403 (forbidden) {mensaje_error}
else rol solicitado not in ('profesional', 'administrador')
  apiu-[#red]->w: HTTP 400 (bad request) {mensaje_error}
else solicitud válida
  apiu-[#red]->dbu: findOne usuario {email}
  dbu-->apiu: {usuario} / null

  alt email ya registrado
    apiu-[#red]->w: HTTP 409 (conflict) {mensaje_error}
  else email disponible
    apiu->apiu: generarPasswordTemporal()
    apiu-->apiu: {pass_temporal}
    apiu->apiu: hashPassword({pass_temporal})
    apiu-->apiu: hash
    apiu-[#red]->dbu: insertOne usuario {nombre, apellido, email, password_hash, rol:'profesional', activo:true}
    dbu-->apiu: {usuario}
    note right apiu
      se envía la contraseña temporal
      por mail al nuevo usuario
      (fuera del alcance de este diagrama)
    end note
    apiu-[#red]->w: HTTP 201 (created) {usuario}
  end
end

@enduml