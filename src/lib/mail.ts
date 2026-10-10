import "server-only";
import nodemailer from "nodemailer";

// Correo saliente por Gmail, con una "contraseña de aplicación" (no la
// contraseña normal de la cuenta).
type Cuenta = { usuario: string; clave: string; nombre: string };

const transporte = (c: Cuenta) =>
  nodemailer.createTransport({ service: "gmail", auth: { user: c.usuario, pass: c.clave } });

export async function probarMail(c: Cuenta): Promise<{ ok: boolean; error?: string }> {
  try {
    await transporte(c).verify();
    return { ok: true };
  } catch {
    return {
      ok: false,
      error:
        "Gmail no aceptó esos datos. Revisá que sea una contraseña de aplicación y que la verificación en dos pasos esté activa.",
    };
  }
}

export async function enviarMail(
  c: Cuenta,
  correo: { para: string; asunto: string; texto: string },
): Promise<{ ok: boolean; error?: string }> {
  try {
    await transporte(c).sendMail({
      from: c.nombre ? { name: c.nombre, address: c.usuario } : c.usuario,
      to: correo.para,
      subject: correo.asunto,
      text: correo.texto,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo enviar el correo." };
  }
}
