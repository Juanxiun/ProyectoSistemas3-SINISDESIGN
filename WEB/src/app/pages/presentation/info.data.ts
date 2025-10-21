export interface ServiciosOfrecidos {
    number: string;
    icon: string;
    title: string;
    items: string[];
}

export const servicesData: ServiciosOfrecidos[] = [
    {
        number: "01",
        icon: "bi bi-house-door",
        title: "Diseño Arquitectónico",
        items: [
            "Planos de construcción y detalle",
            "Renderizado y control de calidad",
            "Planificación 3D y visualizaciones",
            "Asesoramiento en materiales y acabados",
        ],
    },
    {
        number: "02",
        icon: "bi bi-gear",
        title: "Gestión de Proyectos",
        items: [
            "Dirección y administración de obras",
            "Fiscalización y control de calidad",
            "Gestión de permisos y licencias",
            "Coordinación de equipos especializados",
        ],
    },
    {
        number: "03",
        icon: "bi bi-brush",
        title: "Consultoría Especializada",
        items: [
            "Certificación de terrenos y obras",
            "Evaluaciones técnicas y peritajes",
            "Planes de sostenibilidad",
            "Licencias de Ruta y actualización",
        ],
    },
];
