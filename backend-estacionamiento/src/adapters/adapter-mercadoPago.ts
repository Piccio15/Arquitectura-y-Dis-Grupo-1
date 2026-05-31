import { createHmac, timingSafeEqual } from 'node:crypto';

const API_URL = 'https://api.mercadopago.com';

export class ErrorMercadoPago extends Error {}

function obtenerVariable(nombre: string) {
  const valor = process.env[nombre];

  if (!valor) {
    throw new ErrorMercadoPago(`Falta configurar ${nombre}`);
  }

  return valor;
}

async function solicitar<T>(ruta: string, opciones: RequestInit = {}) {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers: {
      Authorization: `Bearer ${obtenerVariable('MP_ACCESS_TOKEN')}`,
      'Content-Type': 'application/json',
      ...opciones.headers
    }
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    throw new ErrorMercadoPago(
      `Mercado Pago respondio ${respuesta.status}: ${detalle}`
    );
  }

  return await respuesta.json() as T;
}

export const MercadoPagoAdapter = {
  crearPreferencia: async (datos: {
    referenciaExterna: string;
    titulo: string;
    monto: number;
  }) => {
    const notificationUrl = process.env.MP_WEBHOOK_URL;
    const backUrl = process.env.MP_BACK_URL;
    const usarRetornoAutomatico = backUrl?.startsWith('https://');

    return await solicitar<{
      id: string;
      init_point: string;
      sandbox_init_point?: string;
    }>('/checkout/preferences', {
      method: 'POST',
      body: JSON.stringify({
        external_reference: datos.referenciaExterna,
        items: [
          {
            title: datos.titulo,
            quantity: 1,
            currency_id: 'ARS',
            unit_price: datos.monto
          }
        ],
        ...(notificationUrl && { notification_url: notificationUrl }),
        ...(usarRetornoAutomatico && {
          back_urls: {
            success: backUrl,
            pending: backUrl,
            failure: backUrl
          },
          auto_return: 'approved'
        })
      })
    });
  },

  obtenerPago: async (paymentId: string) => {
    return await solicitar<{
      id: number;
      status: string;
      external_reference: string | null;
      transaction_amount: number;
    }>(`/v1/payments/${encodeURIComponent(paymentId)}`);
  },

  validarFirmaWebhook: (datos: {
    dataId: string;
    requestId: string | undefined;
    signature: string | undefined;
  }) => {
    const secreto = obtenerVariable('MP_WEBHOOK_SECRET');

    if (!datos.requestId || !datos.signature) {
      return false;
    }

    const partes = Object.fromEntries(
      datos.signature.split(',').map(parte => {
        const [clave, valor] = parte.split('=', 2);
        return [clave.trim(), valor?.trim()];
      })
    );
    const timestamp = partes.ts;
    const firmaRecibida = partes.v1;

    if (!timestamp || !firmaRecibida) {
      return false;
    }

    const manifiesto =
      `id:${datos.dataId.toLowerCase()};request-id:${datos.requestId};ts:${timestamp};`;
    const firmaEsperada = createHmac('sha256', secreto)
      .update(manifiesto)
      .digest('hex');

    if (firmaRecibida.length !== firmaEsperada.length) {
      return false;
    }

    return timingSafeEqual(
      Buffer.from(firmaRecibida, 'utf8'),
      Buffer.from(firmaEsperada, 'utf8')
    );
  }
};
