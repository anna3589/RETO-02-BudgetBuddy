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
            font-size: 1.1rem;
            color: var(--text-dark);
            margin-top: 20px;
            font-weight: 700;
        }

        p,
        li {
            color: var(--text-gray);
            font-size: 1rem;
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
            margin-bottom: 20px;
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
            <p>Este sitio web es <strong>parcialmente conforme</strong> con las Pautas de Accesibilidad para el Contenido Web (WCAG) 2.2. Cumplimos rigurosamente los niveles A y AA, pero existen excepciones en el nivel AAA (el más exigente) que se detallan a continuación.</p>
        </section>

        <section>
            <h2>Contenido Accesible (Niveles A y AA)</h2>
            <p>Hemos implementado las siguientes medidas para asegurar la accesibilidad:</p>
            <ul>
                <li><strong>Estructura semántica robusta:</strong> Uso estricto de regiones HTML5 (<code>nav</code>, <code>main</code>, <code>header</code>) y jerarquía de encabezados lógica.</li>
                <li><strong>Operabilidad por teclado:</strong> Todos los menús, formularios y modales son operables sin ratón, con una gestión de foco visible y lógica.</li>
                <li><strong>Tecnología Asistiva (ARIA):</strong> Etiquetas descriptivas (<code>aria-label</code>, <code>role</code>) en todos los elementos interactivos y gráficos.</li>
                <li><strong>Contraste AA:</strong> Textos con ratio superior a 4.5:1 e interfaz gráfica con ratio superior a 3:1.</li>
                <li><strong>Diseño Adaptable (Reflujo):</strong> El contenido se adapta a pantallas móviles sin pérdida de funcionalidad ni desplazamiento horizontal excesivo.</li>
            </ul>
        </section>

        <section>
            <h2>Contenido no accesible (Nivel AAA)</h2>
            <p>El proyecto no alcanza el nivel de conformidad AAA (Triple A) debido a las siguientes limitaciones técnicas y de alcance:</p>

            <div class="technical-box">
                <h3>1. Contraste Mejorado (Criterio 1.4.6 - Nivel AAA)</h3>
                <p><strong>Requisito:</strong> Se exige un ratio de contraste de 7:1 para texto normal.</p>
                <p><strong>Justificación:</strong> Aunque cumplimos el nivel AA (4.5:1), algunos colores corporativos (verdes de la marca) no alcanzan el ratio 7:1 sin comprometer la identidad visual.</p>
            </div>

            <div class="technical-box">
                <h3>2. Ayuda Contextual (Criterio 3.3.5 - Nivel AAA)</h3>
                <p><strong>Requisito:</strong> Ayuda sensible al contexto disponible para todos los campos.</p>
                <p><strong>Justificación:</strong> Por el alcance académico del proyecto, nos limitamos a etiquetas claras y placeholders (Nivel A/AA) sin un sistema de ayuda contextual extendido.</p>
            </div>

            <div class="technical-box">
                <h3>3. Sin Interrupciones (Criterio 2.2.4 - Nivel AAA)</h3>
                <p><strong>Requisito:</strong> Permitir al usuario posponer o suprimir interrupciones y límites de tiempo.</p>
                <p><strong>Justificación:</strong> Aunque actualmente no hemos implementado un cierre de sesión automático visible, el sistema no ofrece mecanismos explícitos para que el usuario configure o deshabilite posibles tiempos de espera del servidor, por lo que no podemos garantizar este criterio al 100%.</p>
            </div>

            <div class="technical-box">
                <h3>4. Lenguaje de Señas (Criterio 1.2.6 - Nivel AAA)</h3>
                <p><strong>Requisito:</strong> Proporcionar interpretación en lenguaje de señas para todo el contenido de audio pregrabado.</p>
                <p><strong>Justificación:</strong> El proyecto no dispone de recursos para la producción de vídeos con intérpretes de lengua de signos.</p>
            </div>

            <div class="technical-box">
                <h3>5. Pronunciación (Criterio 3.1.6 - Nivel AAA)</h3>
                <p><strong>Requisito:</strong> Mecanismo para identificar la pronunciación específica de palabras cuyo significado sea ambiguo.</p>
                <p><strong>Justificación:</strong> No se ha implementado un glosario fonético integrado para términos financieros complejos.</p>
            </div>
        </section>

        <section>
            <h2>Preparación de esta declaración</h2>
            <p>La presente declaración fue preparada el <strong>{{ date('d/m/Y') }}</strong>.</p>
            <p>El método empleado para preparar la declaración ha sido una autoevaluación llevada a cabo por el propio equipo de desarrollo utilizando:</p>
            <ul>
                <li>WAVE Evaluation Tool (WebAIM)</li>
                <li>Lighthouse (Google Chrome)</li>
            </ul>
        </section>

        <a href="/desktop" class="btn-back">
            <i class="fas fa-arrow-left" style="margin-right: 8px;"></i> Volver al Escritorio
        </a>
    </main>

</body>

</html>