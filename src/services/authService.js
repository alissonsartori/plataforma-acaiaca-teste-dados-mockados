import usuariosData from './usuarios.json';

class AuthService {
  constructor() {
    // Carrega usuários do JSON e armazena em memória
    this.usuarios = [...usuariosData];
    this.nextId = Math.max(...this.usuarios.map(u => u.id)) + 1;
    
    // Tenta restaurar dados da sessão anterior
    this.restoreSession();
  }

  // Restaura sessão do localStorage
  restoreSession() {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token));
        const user = this.usuarios.find(u => u.id === decoded.id);
        if (user) {
          // Sessão válida, mantém os dados
          return true;
        } else {
          // Usuário não encontrado, limpa dados inválidos
          this.clearSession();
        }
      } catch (error) {
        // Token inválido, limpa dados
        this.clearSession();
      }
    }
    return false;
  }

  // Limpa dados da sessão
  clearSession() {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("historia");
    localStorage.removeItem("lastLogin");
    localStorage.removeItem("sessionExpiry");
  }

  // Gera token com expiração
  generateToken(user) {
    const tokenData = {
      id: user.id,
      email: user.email,
      role: user.role,
      iat: Date.now(), // issued at
      exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // expira em 7 dias
    };
    return btoa(JSON.stringify(tokenData));
  }

  // Verifica se o token é válido
  isTokenValid(token) {
    if (!token) return false;
    
    try {
      const decoded = JSON.parse(atob(token));
      const now = Date.now();
      
      // Verifica se o token não expirou
      if (decoded.exp && now > decoded.exp) {
        return false;
      }
      
      // Verifica se o usuário ainda existe
      const user = this.usuarios.find(u => u.id === decoded.id);
      return !!user;
    } catch (error) {
      return false;
    }
  }

  // Login
  login(email, password, role) {
    const usuario = this.usuarios.find(
      u => u.email === email && u.password === password && u.role === role
    );

    if (usuario) {
      // Gera token com expiração
      const token = this.generateToken(usuario);
      
      // Salva dados no localStorage
      this.saveSession(usuario, token);
      
      return {
        success: true,
        user: usuario,
        token: token
      };
    }

    return {
      success: false,
      message: "Credenciais inválidas"
    };
  }

  // Salva sessão no localStorage
  saveSession(user, token) {
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", user.role);
    localStorage.setItem("userName", user.username);
    localStorage.setItem("userId", user.id);
    localStorage.setItem("email", user.email);
    localStorage.setItem("lastLogin", Date.now().toString());
    localStorage.setItem("sessionExpiry", (Date.now() + (7 * 24 * 60 * 60 * 1000)).toString());
    
    if (user.farmerStory) {
      localStorage.setItem("historia", user.farmerStory);
    }
  }

  // Registro
  register(userData) {
    // Verifica se o email já existe
    const emailExists = this.usuarios.find(u => u.email === userData.email);
    if (emailExists) {
      return {
        success: false,
        message: "Email já cadastrado"
      };
    }

    // Cria novo usuário
    const novoUsuario = {
      id: this.nextId++,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      state: userData.state,
      city: userData.city,
      phoneNumber: userData.phoneNumber,
      memberSince: new Date().toISOString().split('T')[0]
    };

    // Adiciona campos específicos para agricultores
    if (userData.role === 'agricultor') {
      novoUsuario.propertyName = userData.propertyName;
      novoUsuario.farmerStory = userData.farmerStory;
      novoUsuario.profileImage = "/src/assets/fotosPerfis/default.png";
      novoUsuario.rating = 0;
      novoUsuario.totalSales = 0;
    }

    // Adiciona à lista de usuários
    this.usuarios.push(novoUsuario);

    // Gera token
    const token = this.generateToken(novoUsuario);

    // Salva dados no localStorage
    this.saveSession(novoUsuario, token);

    return {
      success: true,
      user: novoUsuario,
      token: token
    };
  }

  // Logout
  logout() {
    this.clearSession();
  }

  // Verifica se está logado
  isAuthenticated() {
    const token = localStorage.getItem("token");
    console.log('🔐 authService - Verificando se está autenticado, token:', token ? 'presente' : 'ausente');
    const isValid = this.isTokenValid(token);
    console.log('✅ authService - Token válido:', isValid);
    return isValid;
  }

  // Obtém dados do usuário atual
  getCurrentUser() {
    const token = localStorage.getItem("token");
    console.log('👤 authService - Obtendo usuário atual, token:', token ? 'presente' : 'ausente');
    
    if (!this.isTokenValid(token)) {
      console.log('❌ authService - Token inválido, limpando sessão');
      this.clearSession();
      return null;
    }

    try {
      const decoded = JSON.parse(atob(token));
      console.log('🔓 authService - Token decodificado:', decoded);
      const user = this.usuarios.find(u => u.id === decoded.id);
      console.log('👤 authService - Usuário encontrado:', user ? 'sim' : 'não');
      return user;
    } catch (error) {
      console.log('❌ authService - Erro ao decodificar token:', error);
      this.clearSession();
      return null;
    }
  }

  // Renova o token
  refreshToken() {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const newToken = this.generateToken(currentUser);
      this.saveSession(currentUser, newToken);
      return newToken;
    }
    return null;
  }

  // Atualiza dados do usuário
  updateUser(userId, updates) {
    const userIndex = this.usuarios.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.usuarios[userIndex] = { ...this.usuarios[userIndex], ...updates };
      
      // Atualiza localStorage se for o usuário atual
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        if (updates.username) localStorage.setItem("userName", updates.username);
        if (updates.farmerStory) localStorage.setItem("historia", updates.farmerStory);
        
        // Renova o token com dados atualizados
        const newToken = this.generateToken(this.usuarios[userIndex]);
        this.saveSession(this.usuarios[userIndex], newToken);
      }
      
      return {
        success: true,
        user: this.usuarios[userIndex]
      };
    }
    
    return {
      success: false,
      message: "Usuário não encontrado"
    };
  }

  // Obtém informações da sessão
  getSessionInfo() {
    const token = localStorage.getItem("token");
    const lastLogin = localStorage.getItem("lastLogin");
    const sessionExpiry = localStorage.getItem("sessionExpiry");
    
    if (!token) return null;
    
    try {
      const decoded = JSON.parse(atob(token));
      return {
        userId: decoded.id,
        email: decoded.email,
        role: decoded.role,
        lastLogin: lastLogin ? new Date(parseInt(lastLogin)) : null,
        expiresAt: sessionExpiry ? new Date(parseInt(sessionExpiry)) : null,
        isValid: this.isTokenValid(token)
      };
    } catch (error) {
      return null;
    }
  }

  // Obtém todos os usuários (para debug)
  getAllUsers() {
    return this.usuarios;
  }
}

// Cria uma instância única do serviço
const authService = new AuthService();

export default authService; 