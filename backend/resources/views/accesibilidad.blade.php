<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BudgetBuddy | Declaración de Accesibilidad</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <style>
        :root {
            --primary: #10b981;
            --text-dark: #1f2937;
            --text-gray: #4b5563;
            --bg-light: #f3f4f6;
        }

        body {
            font-family: 'Outfit', sans-serif;
            background-color: var(--bg-light);
            color: var(--text-dark);
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }

        .access-container {
            max-width: 900px;
            margin: 40px auto;
            background: white;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        h1 {
            color: var(--primary);
            font-size: 2.5rem;
            margin-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
        }

        h2 {
            color: #065f46;
            margin-top: 30px;
            font-size: 1.5rem;
        }

        h3 {
            font-size: 1.2rem;
            color: var(--text-dark);
            margin-top: 20px;
        }

        p,
        li {
            color: var(--text-gray);
            font-size: 1.05rem;
        }

        ul {
            padding-left: 20px;
        }

        li {
            margin-bottom: 10px;
        }

        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 50px;
            font-weight: 700;
            font-size: 0.9rem;
            margin-bottom: 20px;
        }

        .status-partial {
            background-color: #fef3c7;
            color: #92400e;
            border: 1px solid #d97706;
        }

        .btn-back {
            display: inline-flex;
            align-items: center;
            margin-top: 40px;
            padding: 12px 24px;
            background-color: var(--primary);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: background 0.3s;
        }

        .btn-back:hover {
            background-color: #059669;
        }

        .technical-box {
            background-color: #f8fafc;
            border-left: 4px solid var(--primary);
            padding: 15px;
            margin: 20px 0;
        }
    </style>
</head>

<body>

    <main class="access-container">
        <header>
            <h1>Declaración de Accesibilidad</h1>
            <p>BudgetBuddy se compromete a hacer accesible su sitio web de conformidad con el Real Decreto 1112/2018.</p>
        </header>

        <section>
            <h2>Situación de cumplimiento</h2>
            <div class="status-badge status-partial">
                <i class="fas fa-check-circle"></i> Parcialmente conforme con el Nivel AA
            </div>
            <p>Este sitio web es <strong>parcialmente conforme</strong> con las Pautas de Accesibilidad para el Contenido Web (WCAG) 2.2 debido a las excepciones que se indican a continuación.</p>
        </section>

        <section>
            <h2>Contenido Accesible (Niveles A y AA)</h2>
            <p>Hemos implementado las siguientes medidas para asegurar la accesibilidad:</p>
            <ul>
                <li><strong>Estructura semántica:</strong> Uso correcto de etiquetas HTML5 (<code>nav</code>, <code>main</code>, <code>header</code>) para facilitar la navegación con lectores de pantalla.</li>
                <li><strong>Navegación por teclado:</strong> Todos los elementos interactivos (menús, formularios, modales) son operables mediante teclado, incluyendo la gestión del foco en ventanas modales.</li>
                <li><strong>Etiquetas ARIA:</strong> Uso de atributos <code>aria-label</code>, <code>role</code> y <code>aria-hidden</code> para mejorar la experiencia de tecnologías de asistencia en componentes complejos como gráficos y barras laterales.</li>
                <li><strong>Contraste:</strong> Se ha asegurado un ratio de contraste mínimo de 4.5:1 en textos normales y 3:1 en textos grandes e iconos gráficos.</li>
                <li><strong>Diseño Responsive:</strong> La web se adapta fluidamente a diferentes tamaños de pantalla sin pérdida de información (Reflujo).</li>
            </ul>
        </section>

        <section>
            <h2>Contenido no accesible (Nivel AAA)</h2>
            <p>El contenido que se detalla a continuación no es accesible porque el proyecto no alcanza el nivel de conformidad AAA (Triple A):</p>

            <div class="technical-box">
                <h3>1. Contraste Mejorado (Criterio 1.4.6 - Nivel AAA)</h3>
                <p><strong>Requisito:</strong> Se exige un ratio de contraste de 7:1 para texto normal.</p>
                <p><strong>Justificación:</strong> Aunque cumplimos el nivel AA (4.5:1), algunos colores de la identidad corporativa de BudgetBuddy (tonos verdes específicos) no alcanzan el ratio 7:1 necesario para el nivel AAA sin comprometer la identidad visual de la marca.</p>
            </div>

            <div class="technical-box">
                <h3>2. Ayuda Contextual (Criterio 3.3.5 - Nivel AAA)</h3>
                <p><strong>Requisito:</strong> Proporcionar ayuda sensible al contexto para todos los campos de entrada.</p>
                <p><strong>Justificación:</strong> Debido a la complejidad técnica y el alcance académico del proyecto, no se ha implementado un sistema de ayuda contextual detallado para cada campo de formulario, limitándonos a etiquetas claras y placeholders (Nivel A/AA).</p>
            </div>

            <div class="technical-box">
                <h3>3. Sin Interrupciones (Criterio 2.2.4 - Nivel AAA)</h3>
                <p><strong>Requisito:</strong> Permitir al usuario posponer o suprimir interrupciones, excepto emergencias.</p>
                <p><strong>Justificación:</strong> Por motivos de seguridad bancaria simulada, la sesión expira tras un periodo de inactividad (configuración por defecto de Laravel) sin opción de posponerla indefinidamente.</p>
            </div>
        </section>

        <section>
            <h2>Preparación de esta declaración de accesibilidad</h2>
            <p>La presente declaración fue preparada el <strong>{{ date('d/m/Y') }}</strong>.</p>
            <p>El método empleado para preparar la declaración ha sido una autoevaluación llevada a cabo por el propio equipo de desarrollo utilizando las herramientas:</p>
            <ul>
                <li>WAVE Evaluation Tool (WebAIM)</li>
                <li>Lighthouse (Google Chrome)</li>
            </ul>
        </section>

        <a href="/dashboard" class="btn-back">
            <i class="fas fa-arrow-left" style="margin-right: 8px;"></i> Volver al Escritorio
        </a>
    </main>

</body>

</html>