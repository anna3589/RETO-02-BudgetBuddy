<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>BudgetBuddy | Mi cuenta</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <link rel="stylesheet" href="{{ asset('css/backstyle.css') }}" />
    <link rel="stylesheet" href="{{ asset('css/backnotification.css') }}" />
    <link rel="stylesheet" href="{{ asset('css/backajustes.css') }}" />
</head>

<body class="desktop-body">
    @if (session('success'))
    <div class="notification notification-success" style="position:fixed; top:20px; right:20px; z-index:9999; display:flex;">
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>{{ session('success') }}</span>
        </div>
    </div>
    <script>setTimeout(() => document.querySelector('.notification-success')?.remove(), 4000);</script>
    @endif

    @if ($errors->any())
    <div class="notification notification-danger" style="position:fixed; top:20px; right:20px; z-index:9999; display:flex; background-color:#fee2e2; color:#991b1b;">
        <div class="notification-content">
            <i class="fas fa-exclamation-circle"></i>
            <span>Por favor, corrige los errores del formulario.</span>
        </div>
    </div>
    @endif

    <header class="desktop-header">
        <div class="desktop-brand">
            <img src="{{ asset('images/logo_budget_expand.png') }}" alt="Logo">
        </div>
        <div class="desktop-header-right">
            <div class="user-profile-top">
                <div class="user-avatar-top" title="Mi perfil">
                    {{ strtoupper(substr($user->name, 0, 1)) }}
                </div>
            </div>
        </div>
    </header>

    <div class="sidebar">
        <div class="nav-menu">
            <a href="/desktop" class="nav-item" title="Inicio"><i class="fas fa-home"></i></a>
            <a href="/api-estadisticas" class="nav-item" title="Estadísticas"><i class="fas fa-chart-line"></i></a>
            <a href="/misTarjetas" class="nav-item" title="Tarjetas"><i class="fas fa-credit-card"></i></a>
            <a href="/ajustes" class="nav-item active" title="Ajustes"><i class="fas fa-cog"></i></a>
        </div>
    </div>

    <div class="desktop-container">
        <main class="desktop-main">
            <div class="page-header">
                <h1 class="page-title">Mi cuenta</h1>
                <button class="btn btn-secondary" id="edit-profile-btn">
                    <i class="fas fa-edit"></i> Editar perfil
                </button>
            </div>

            <div class="desktop-grid">
                <section class="desktop-left-column">
                    <div class="card">
                        <div class="card-header-compact">
                            <h2 class="card-title">Perfil</h2>
                        </div>

                        <div class="profile-view-mode" id="profile-view-mode">
                            <div class="profile-avatar-section">
                                <div class="profile-avatar-large">
                                    {{ strtoupper(substr($user->name, 0, 1) . substr($user->profile->lastname ?? '', 0, 1)) }}
                                </div>
                                <div class="profile-name-view">
                                    <h3>{{ $user->name }} {{ $user->profile->lastname ?? '' }}</h3>
                                </div>
                            </div>
                            <div class="profile-info-view">
                                <div class="info-row">
                                    <div class="info-label">Correo</div>
                                    <div class="info-value">{{ $user->email }}</div>
                                </div>
                                <div class="info-row">
                                    <div class="info-label">Teléfono</div>
                                    <div class="info-value">{{ $user->profile->phone ?? 'Sin teléfono' }}</div>
                                </div>
                            </div>
                        </div>

                        <div class="profile-edit-mode" id="profile-edit-mode" style="display: none;">
                            <div class="profile-avatar-section">
                                <div class="profile-avatar-large">
                                    {{ strtoupper(substr($user->name, 0, 1)) }}
                                </div>
                            </div>

                            <form class="profile-form" id="profile-form" action="{{ route('profile.update') }}" method="POST">
                                @csrf           @method('PUT')  <div class="form-row">
                                    <div class="form-group">
                                        <label for="first-name">Nombre</label>
                                        <input type="text" name="first_name" id="first-name" class="editable-input" value="{{ old('first_name', $user->name) }}" required>
                                        @error('first_name') <span style="color:red; font-size:12px;">{{ $message }}</span> @enderror
                                    </div>
                                    <div class="form-group">
                                        <label for="last-name">Apellido</label>
                                        <input type="text" name="last_name" id="last-name" class="editable-input" value="{{ old('last_name', $user->profile->lastname ?? '') }}">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="email">Correo electrónico</label>
                                    <input type="email" name="email" id="email" class="editable-input" value="{{ old('email', $user->email) }}" required>
                                    @error('email') <span style="color:red; font-size:12px;">{{ $message }}</span> @enderror
                                </div>
                                <div class="form-group">
                                    <label for="phone">Teléfono</label>
                                    <input type="tel" name="phone" id="phone" class="editable-input" value="{{ old('phone', $user->profile->phone ?? '') }}">
                                </div>
                                
                                @if ($errors->any()) <div id="form-has-errors" style="display:none"></div> @endif

                                <div class="form-actions">
                                    <button type="button" class="btn btn-secondary" id="cancel-edit-btn">Cancelar</button>
                                    <button type="submit" class="btn btn-primary" id="save-changes-btn">Guardar cambios</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header-compact"><h2 class="card-title">Seguridad</h2></div>
                        <div class="security-settings">
                            <div class="security-item">
                                <div class="security-info"><h4>Cambiar contraseña</h4></div>
                                <button class="btn btn-secondary" id="change-password-btn">Cambiar</button>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="desktop-right-column">
                    <div class="card">
                        <div class="card-header-compact"><h2 class="card-title">Más opciones</h2></div>
                        <div class="other-settings">
                            <div class="settings-item logout-item">
                                <div class="settings-info"><h4>Salir de la cuenta</h4></div>
                                <button class="btn btn-secondary" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Salir</button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    </div>

    <div class="modal" id="password-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Cambiar contraseña</h3>
                <button class="close-modal" id="close-password-modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="password-form">
                    <div class="form-group"><label>Actual</label><input type="password" required></div>
                    <div class="form-group"><label>Nueva</label><input type="password" required></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="cancel-password-btn">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script src="{{ asset('js/backajustes.js') }}"></script>
</body>
</html>