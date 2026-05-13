import React from 'react';
import { Accordion } from "../../../../components";

const EventRules = ({
  event
}) => {
  return (
    <>
      {event.rules && event.rules.length > 0 ? (
        event.rules.map((rule, idx) => (
          <div key={rule.id || idx} className="glass-module-industrial">
            <Accordion
              title={rule.title}
              icon={rule.icon}
            >
              <p style={{ whiteSpace: "pre-line" }}>{rule.description}</p>
            </Accordion>
          </div>
        ))
      ) : (
        <>
          <div className="glass-module-industrial">
            <Accordion
              title="Reglas de Acceso y Límites"
              icon="alertTriangle"
            >
              <p><strong>Límite de edad:</strong> Sin límite de edad (sujeto a cambios por evento).</p>
              <p><strong>Pagan boleto a partir de:</strong> 3 años de edad.</p>
              <p><strong>Restricciones:</strong> Se prohíbe el ingreso de alimentos y/o bebidas ajenos al inmueble. También se prohíbe el acceso de objetos voluminosos, cámaras fotográficas o de video profesionales.</p>
              <p><strong>Límite de acceso:</strong> Una vez iniciada la función, se dará acceso a sala en un momento adecuado determinado por el personal.</p>
              <p><strong>Límite de boletos:</strong> Máximo 10 boletos por persona/transacción.</p>
            </Accordion>
          </div>

          <div className="glass-module-industrial">
            <Accordion
              title="Servicios y Duración"
              icon="info"
            >
              <p><strong>Servicios en el Inmueble:</strong> Barras de snacks y bebidas, venta de mercancía oficial, sanitarios, stands para toma de fotos.</p>
              <p><strong>Duración aproximada:</strong> 2 horas (puede variar según el evento).</p>
              <p><strong>Accesibilidad:</strong> Contamos con zonas designadas para sillas de ruedas. Por favor contacte al personal a su llegada.</p>
            </Accordion>
          </div>
        </>
      )}
    </>
  );
};

export default EventRules;
