import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client.js';
import { fmtFecha } from '../utils/fecha.js';
import { fmt, padC } from '../utils/formato.js';

export default function Comprobante() {
  const { id } = useParams();
  const [n, setN] = useState(null);

  useEffect(() => {
    api.get(`/nomina/${id}/comprobante`).then(r => setN(r.data)).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (n) { const t = setTimeout(() => window.print(), 600); return () => clearTimeout(t); }
  }, [n]);

  if (!n) return <div style={{ padding: 32, textAlign: 'center', color: '#999' }}>Cargando colilla...</div>;

  const emp = n.empresa || {};
  const nombreEmpresa = emp.nombre_empresa || 'AVÍCOLA Y MISCELÁNEA LOS FLAMENCOS';
  const tieneEmpresa = emp.nit || emp.ciudad || emp.telefono || emp.email;

  const Desprendible = ({ copia }) => (
    <div style={{ height: '50%', boxSizing: 'border-box', padding: '14px 32px', fontFamily: 'Arial,sans-serif', fontSize: '11px', color: '#111', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        {/* ENCABEZADO EMPRESA */}
        <table style={{ width: '100%', borderBottom: '2.5px solid #1e3a5f', paddingBottom: '7px', marginBottom: '10px' }}>
          <tbody><tr>
            <td style={{ verticalAlign: 'top' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e3a5f' }}>{nombreEmpresa}</div>
              {tieneEmpresa && (
                <div style={{ fontSize: '8.5px', color: '#555', marginTop: '3px', lineHeight: '1.6' }}>
                  {emp.nit && <span>NIT: {emp.nit}&nbsp;&nbsp;</span>}
                  {emp.ciudad && <span>📍 {emp.ciudad}&nbsp;&nbsp;</span>}
                  {emp.telefono && <span>📞 {emp.telefono}&nbsp;&nbsp;</span>}
                  {emp.email && <span>✉️ {emp.email}</span>}
                </div>
              )}
              <div style={{ fontSize: '9px', color: '#777', textTransform: 'uppercase', marginTop: '2px' }}>
                Comprobante de Pago de Nómina — <strong>{copia}</strong>
              </div>
            </td>
            <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
              <div style={{ fontSize: '9px', color: '#777' }}>No. Comprobante</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '16px', color: '#b91c1c' }}>{padC(n.consecutivo)}</div>
            </td>
          </tr></tbody>
        </table>

        {/* DATOS DEL COLABORADOR */}
        <table style={{ width: '100%', fontSize: '10.5px', marginBottom: '12px', lineHeight: '1.9', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ width: '18%', fontWeight: 'bold' }}>Colaborador:</td>
              <td style={{ width: '40%', borderBottom: '1px solid #ddd' }}>{n.nombre_empleado}</td>
              <td style={{ width: '18%', fontWeight: 'bold', paddingLeft: '12px' }}>Fecha de Pago:</td>
              <td style={{ borderBottom: '1px solid #ddd' }}>{fmtFecha(n.fecha)}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold' }}>Tipo:</td>
              <td style={{ borderBottom: '1px solid #ddd' }}>{n.tipo_empleado === 'FIJO' ? 'Fijo (planta)' : 'Variable (turnos)'}</td>
              <td style={{ fontWeight: 'bold', paddingLeft: '12px' }}>Base Período:</td>
              <td style={{ borderBottom: '1px solid #ddd' }}>Por {n.base_periodo}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold' }}>Registrado por:</td>
              <td colSpan={3} style={{ borderBottom: '1px solid #ddd' }}>{n.usuario_name}</td>
            </tr>
          </tbody>
        </table>

        {/* TABLA DE LIQUIDACIÓN */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', marginBottom: '12px' }}>
          <thead>
            <tr style={{ background: '#1e3a5f', color: 'white' }}>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>Descripción del Concepto de Pago</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', width: '13%' }}>Cantidad</th>
              <th style={{ padding: '6px 8px', textAlign: 'right', width: '20%' }}>Valor Unitario</th>
              <th style={{ padding: '6px 8px', textAlign: 'right', width: '20%' }}>Total Devengado</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: '#f0f4fa' }}>
              <td style={{ padding: '7px 8px', borderBottom: '1px solid #ddd' }}>Sueldo básico / Servicios prestados</td>
              <td style={{ padding: '7px 8px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{Math.round(Number(n.cantidad_trabajada))}</td>
              <td style={{ padding: '7px 8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>{fmt(n.tarifa_aplicada)}</td>
              <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>{fmt(n.total_pagado)}</td>
            </tr>
            <tr>
              <td colSpan={2}></td>
              <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 'bold', borderTop: '2px solid #1e3a5f' }}>NETO RECIBIDO:</td>
              <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 'bold', fontSize: '13px', borderTop: '2px solid #1e3a5f', color: '#1e3a5f' }}>{fmt(n.total_pagado)}</td>
            </tr>
          </tbody>
        </table>

        {/* TEXTO LEGAL */}
        <div style={{ border: '1px solid #ccc', padding: '7px 10px', fontSize: '8.5px', lineHeight: '1.5', textAlign: 'justify', color: '#444', background: '#fafafa', marginBottom: '14px' }}>
          <strong>CONSTANCIA DE RECIBO A SATISFACCIÓN:</strong> Declaro haber recibido de <strong>{nombreEmpresa}</strong>{emp.nit ? ` (NIT: ${emp.nit})` : ''} la suma indicada en este documento, en cumplimiento oportuno de los servicios prestados durante el período señalado. Con la firma de este recibo, la empresa queda a paz y salvo por todo concepto correspondiente a dicho período.
        </div>
      </div>

      {/* FIRMAS */}
      <table style={{ width: '100%', fontSize: '10px' }}>
        <tbody><tr>
          <td style={{ width: '42%', textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #000', width: '90%', margin: '0 auto 4px auto' }}></div>
            <strong>FIRMA Y SELLO — PAGADOR</strong><br />
            <span style={{ fontSize: '8.5px', color: '#555' }}>
              {nombreEmpresa}<br />
              {emp.nit ? `NIT: ${emp.nit}` : 'NIT / C.C.: _________________________'}
            </span>
          </td>
          <td style={{ width: '16%' }}></td>
          <td style={{ width: '42%', textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #000', width: '90%', margin: '0 auto 4px auto' }}></div>
            <strong>FIRMA — COLABORADOR</strong><br />
            <span style={{ fontSize: '8.5px', color: '#555' }}>{n.nombre_empleado}<br />C.C.: _________________________</span>
          </td>
        </tr></tbody>
      </table>
    </div>
  );

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; }
        @media screen {
          body { background: #e5e7eb; display: flex; flex-direction: column; align-items: center; padding: 20px; }
          .hoja { background: white; width: 750px; height: calc(297mm * 0.9); box-shadow: 0 0 12px rgba(0,0,0,0.15); display: flex; flex-direction: column; }
          .btn-imp { margin-bottom: 16px; background: #1e3a5f; color: white; border: none; padding: 10px 28px; font-size: 14px; font-weight: bold; border-radius: 6px; cursor: pointer; }
        }
        @media print {
          body { margin: 0; background: white; }
          @page { margin: 0; size: letter; }
          .btn-imp { display: none !important; }
          .hoja { width: 100%; height: 100vh; display: flex; flex-direction: column; }
        }
        .corte { border-top: 1.5px dashed #aaa; position: relative; flex-shrink: 0; }
        .corte span { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); background: white; padding: 0 10px; font-size: 9px; color: #999; white-space: nowrap; }
      `}</style>
      <button className="btn-imp" onClick={() => window.print()}>🖨️ Imprimir Colilla</button>
      <div className="hoja">
        <Desprendible copia="Copia Empresa" />
        <div className="corte"><span>✂ &nbsp; RECORTE AQUÍ &nbsp; ✂</span></div>
        <Desprendible copia="Copia Colaborador" />
      </div>
    </>
  );
}
