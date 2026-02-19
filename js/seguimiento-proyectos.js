/**
 * Configuración de mapas para el instrumento SEGUIMIENTO DE PROYECTOS
 */

// Paleta de colores institucionales / distintivos para Gerencias
const GERENCIA_COLORS = {
    'central': '#8B0000',      // Rojo oscuro
    'oriental': '#FF8C00',      // Naranja oscuro
    'occidental': '#4682B4',   // Azul acero
    'noroeste': '#556B2F',     // Verde oliva oscuro
    'norte': '#00008B',        // Azul oscuro
    'noreste': '#800080',      // Púrpura
    'baja california': '#2E8B57', // Verde mar
    'baja california sur': '#DAA520', // Vara de oro
    'peninsular': '#D2691E',    // Chocolate
    'default': '#999999'        // Gris (fallback)
};

/**
 * Helper para crear popups estandarizados y "bonitos"
 * @param {Object} options - Configuración del popup
 * @param {string} options.title - Título principal (nombre)
 * @param {string} options.subtitle - Subtítulo (tipo, estado, etc.)
 * @param {Array<{label: string, value: string}>} options.details - Lista de detalles
 * @param {string} options.icon - Clase del icono Bootstrap (bi-...)
 * @param {string} options.color - Color principal para el icono y título
 */
function createStandardPopup(options) {
    const { title, subtitle, details, icon, color } = options;
    const safeTitle = title || 'Sin Nombre';
    const safeSubtitle = subtitle || '';
    const safeColor = color || '#333';

    // Generar HTML de detalles
    const detailsHtml = (details || []).map(d => `
        <div style="margin-top: 4px; font-size: 12px;">
            <strong>${d.label}:</strong> ${d.value}
        </div>
    `).join('');

    return `
        <div style="font-family: 'Noto Sans', sans-serif; max-width: 280px; line-height: 1.4;">
            <div style="font-size: 15px; font-weight: 700; color: ${safeColor}; border-bottom: 2px solid ${safeColor}20; padding-bottom: 8px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <i class="bi ${icon || 'bi-geo-alt-fill'}" style="font-size: 18px;"></i>
                <span>${safeTitle}</span>
            </div>
            ${safeSubtitle ? `<div style="font-size: 13px; color: #666; margin-bottom: 8px; font-style: italic;">${safeSubtitle}</div>` : ''}
            <div style="color: #444;">
                ${detailsHtml}
            </div>
        </div>
    `;
}

window.createStandardPopup = createStandardPopup;

const SEGUIMIENTO_PROYECTOS_MAPS = [
    {
        name: 'Infraestructura Eléctrica',
        description: 'Visualización de Centrales, Gerencias, Líneas y Subestaciones',
        sheetUrl: null, // Sin hoja de datos
        baseMap: 'carto-voyager', // Mapa base claro/color
        geojsonUrl: null,
        geojsonUrlType: null,

        additionalLayers: [
            {
                url: 'https://cdn.sassoapps.com/geojson/Centrales_El%C3%A9ctricas_privadas_y_de_CFE.geojson',
                type: 'centrales',
                name: 'Centrales Eléctricas',
                category: 'domain',
                pointToLayer: function (feature, latlng) {
                    const icon = L.divIcon({
                        className: 'electricity-marker-icon',
                        html: '<img src="https://cdn.sassoapps.com/iconos/central_electrica.png" style="width: 28px; height: 28px;">',
                        iconSize: [28, 28],
                        iconAnchor: [14, 14],
                        popupAnchor: [0, -14]
                    });
                    return L.marker(latlng, { icon: icon });
                },
                popup: (properties) => {
                    const content = createStandardPopup({
                        title: properties.Razón_social || properties.EmpresaLíder || 'Central Eléctrica',
                        subtitle: properties.Tecnología || properties.Clasifica_Menú || 'Tecnología no especificada',
                        icon: 'bi-lightning-charge-fill',
                        color: '#FF8F00',
                        details: [
                            { label: 'Capacidad', value: `${(properties.Capacidad_operacion_MW || properties.Capacidad_autorizada_MW || 0).toLocaleString('es-MX')} MW` },
                            { label: 'Generación Anual', value: `${(properties.Generación_estimada_anual || 0).toLocaleString('es-MX')} GWh` },
                            { label: 'Ubicación', value: properties.Ubicación || properties.Estado || 'N/D' },
                            { label: 'Municipio', value: properties.MPO_ID || properties.Municipio || 'N/D' },
                            { label: 'Estatus', value: properties.Estatus_instalacion || properties.Estatus || 'N/D' },
                            { label: 'Combustible', value: properties.Combustible_autorizado_1 || properties.Energetico_primario || 'N/D' },
                            { label: 'Inicio Operaciones', value: properties.Fecha_de_Entrada_en_Operación || properties.Inicio_operaciones || 'N/D' },
                            { label: 'Modalidad', value: properties.Modalidad || 'N/D' },
                            { label: 'Permiso', value: properties.NumeroPermiso || 'N/D' }
                        ]
                    });

                    const id = properties.NumeroPermiso || properties.Razón_social;
                    console.log('🔗 [SeguimientoProyectos] Generando enlace para central:', id); // Debug Log
                    const btnHtml = `
                        <div style="margin-top: 12px; text-align: center; border-top: 1px solid #eee; padding-top: 8px;">
                            <a href="detalle-central.html?permiso=${encodeURIComponent(id)}" target="_blank"
                               style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background-color: #FF8F00; color: white; text-decoration: none; border-radius: 20px; font-size: 13px; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: transform 0.2s;">
                                <i class="bi bi-eye-fill"></i> Ver Detalle Completo
                            </a>
                        </div>
                    `;

                    // Inyectar botón al final
                    return content + btnHtml;
                }
            },
            {
                url: 'https://cdn.sassoapps.com/Mapas/Electricidad/gerenciasdecontrol.geojson',
                type: 'gerencias',
                name: 'Gerencias de Control',
                category: 'domain',
                style: (feature) => {
                    const props = feature.properties || {};
                    const name = (props.Name || props.name || props.NOMBRE || 'Default').toLowerCase();

                    let color = GERENCIA_COLORS['default'];
                    const keys = Object.keys(GERENCIA_COLORS);

                    for (const key of keys) {
                        if (name.includes(key)) {
                            color = GERENCIA_COLORS[key];
                            break;
                        }
                    }

                    return {
                        fillColor: color,
                        weight: 2,
                        opacity: 1,
                        color: 'white',
                        dashArray: '3',
                        fillOpacity: 0.4,
                        pane: 'gerenciasPane'
                    };
                },
                popup: (properties) => createStandardPopup({
                    title: properties.Name || properties.name || properties.NOMBRE || 'Gerencia Regional',
                    subtitle: 'Gerencia de Control Regional',
                    icon: 'bi-buildings-fill',
                    color: '#1565C0', // Blue 800
                    details: [
                        { label: 'Código', value: properties.GCR || properties.id || 'N/A' }
                    ]
                })
            },
            {
                url: 'https://cdn.sassoapps.com/geojson/L%C3%ADneas_de_Transmisi%C3%B3n.geojson',
                type: 'lineas',
                name: 'Líneas de Transmisión',
                category: 'domain',
                style: {
                    color: '#424242', // Grey 800
                    weight: 2.5,
                    opacity: 0.85,
                    pane: 'municipalitiesPane'
                },
                popup: (properties) => createStandardPopup({
                    title: properties.nombre_lt || 'Línea de Transmisión',
                    subtitle: `${properties.tension_kv || '?'} kV`,
                    icon: 'bi-bezier2',
                    color: '#424242',
                    details: [
                        { label: 'Longitud', value: `${properties.longi_km || 'N/A'} km` },
                        { label: 'Características', value: properties.caracteri || 'N/A' }
                    ]
                })
            },
            {
                url: 'https://cdn.sassoapps.com/geojson/Subestaciones_El%C3%A9ctricas.geojson',
                type: 'subestaciones',
                name: 'Subestaciones',
                category: 'domain',
                style: {
                    radius: 4,
                    fillColor: '#78909C', // Blue Grey 400
                    color: '#263238', // Blue Grey 900
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.85,
                    pane: 'electricityMarkersPane' // Z-Index 650
                },
                popup: (properties) => createStandardPopup({
                    title: properties.nom_geo !== 'N/D' ? properties.nom_geo : 'Subestación Eléctrica',
                    subtitle: properties.condicion || 'Condición no especificada',
                    icon: 'bi-grid-fill',
                    color: '#455A64', // Blue Grey 700
                    details: [
                        { label: 'Código', value: properties.codigo || 'N/A' },
                        { label: 'Clase', value: properties.clase_geo || 'N/A' },
                        { label: 'Nombre Objeto', value: properties.nom_obj || 'N/A' }
                    ]
                })
            },
            {
                url: 'https://cdn.sassoapps.com/Gabvy/ramsar.geojson',
                type: 'ramsar',
                name: 'Sitios Ramsar',
                category: 'analysis',
                style: {
                    fillColor: '#00ACC1', // Cyan 600
                    color: '#006064',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.5
                },
                popup: (properties) => createStandardPopup({
                    title: properties.NOMBRE || properties.Name || 'Sitio Ramsar',
                    subtitle: 'Humedal de Importancia Internacional',
                    icon: 'bi-water',
                    color: '#00838F',
                    details: [
                        { label: 'Estado', value: properties.ESTADO || properties.estado || 'N/A' },
                        { label: 'Municipios', value: properties.MUNICIPIOS || 'N/A' }
                    ]
                })
            },
            {
                url: 'https://cdn.sassoapps.com/Mapas/ANP2025.geojson',
                type: 'anp',
                name: 'Áreas Naturales Protegidas',
                category: 'analysis',
                style: {
                    fillColor: '#66BB6A', // Green 400
                    color: '#1B5E20',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.5
                },
                popup: (properties) => createStandardPopup({
                    title: properties.NOMBRE || properties.Name || 'ANP',
                    subtitle: properties.CAT_DEC || properties.categoria || 'Categoría N/D',
                    icon: 'bi-tree-fill',
                    color: '#2E7D32',
                    details: [
                        { label: 'Estado', value: properties.ESTADOS || properties.estados || 'N/A' },
                        { label: 'Superficie', value: properties.SUPERFICIE ? `${Number(properties.SUPERFICIE).toLocaleString()} ha` : 'N/A' }
                    ]
                })
            },
            {
                url: 'https://cdn.sassoapps.com/Mapas/areas_destinadas_voluntariamentea_la_conservaci%C3%B3n.geojson',
                type: 'advc',
                name: 'ADVC',
                category: 'analysis',
                style: {
                    fillColor: '#9CCC65', // Light Green 400
                    color: '#33691E',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.5
                },
                popup: (properties) => createStandardPopup({
                    title: properties.NOMBRE || properties.Name || 'ADVC',
                    subtitle: 'Área Destinada Voluntariamente a la Conservación',
                    icon: 'bi-flower1',
                    color: '#558B2F',
                    details: [
                        { label: 'Estado', value: properties.ESTADO || 'N/A' },
                        { label: 'Municipio', value: properties.MUNICIPIO || 'N/A' }
                    ]
                })
            }
        ],
        center: [23.6345, -102.5528], // Centro de México
        zoom: 5,
        minZoom: 4,
        maxZoom: 18
    }
];

// Hacer disponible globalmente
window.SEGUIMIENTO_PROYECTOS_MAPS = SEGUIMIENTO_PROYECTOS_MAPS;
