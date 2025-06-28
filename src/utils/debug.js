// Funções de debug para verificar dados dos JSONs

// Verificar dados no localStorage
export const checkLocalStorageData = () => {
  console.log('📊 Verificando dados no localStorage...');
  
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  const userRole = localStorage.getItem('userRole');
  
  console.log('🔐 Token:', token ? 'Presente' : 'Ausente');
  console.log('👤 User ID:', userId);
  console.log('📝 User Name:', userName);
  console.log('🎭 User Role:', userRole);
  
  if (token) {
    try {
      const decoded = JSON.parse(atob(token));
      console.log('Token decodificado:', decoded);
    } catch (error) {
      console.log('❌ Erro ao decodificar token:', error);
    }
  }
  
  return { token, userId, userName, userRole };
};

// Verificar dados dos JSONs
export const checkJsonData = async () => {
  console.log('📦 Verificando dados dos JSONs...');
  
  try {
    const usuariosResponse = await fetch('/src/services/usuarios.json');
    const usuarios = await usuariosResponse.json();
    
    const produtosResponse = await fetch('/src/services/produtos.json');
    const produtos = await produtosResponse.json();
    
    console.log('👥 Usuários:', usuarios.length);
    console.log('📦 Produtos:', produtos.length);
    
    // Filtrar agricultores dos usuários
    const agricultores = usuarios.filter(u => u.role === 'agricultor');
    console.log('👨‍🌾 Agricultores:', agricultores.length);
    
    // Verificar produtos com agricultores válidos
    const produtosComAgricultor = produtos.filter(p => 
      agricultores.some(a => a.id === p.agricultorId)
    );
    console.log('✅ Produtos com agricultor válido:', produtosComAgricultor.length);
    
    return { usuarios, produtos, agricultores, produtosComAgricultor };
  } catch (error) {
    console.error('❌ Erro ao carregar JSONs:', error);
    return null;
  }
};

// Função para fazer login automático com usuário de teste
export const autoLoginTestUser = async () => {
  console.log('🔐 Fazendo login automático com usuário de teste...');
  
  try {
    const usuariosResponse = await fetch('/src/services/usuarios.json');
    const usuarios = await usuariosResponse.json();
    
    const user = usuarios.find(u => 
      u.email === 'alisson.sartori@email.com' && 
      u.password === 'Teste@123' && 
      u.role === 'agricultor'
    );
    
    if (user) {
      // Gerar token simples
      const token = btoa(JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
        iat: Date.now(),
        exp: Date.now() + (7 * 24 * 60 * 60 * 1000)
      }));

      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userName', user.username);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('email', user.email);
      if (user.farmerStory) {
        localStorage.setItem('historia', user.farmerStory);
      }
      
      console.log('✅ Login realizado com sucesso!');
      console.log('👤 Usuário:', user.username);
      console.log('🆔 ID:', user.id);
      console.log('🎭 Role:', user.role);
      
      // Recarregar a página para aplicar o login
      window.location.reload();
    } else {
      console.log('❌ Usuário de teste não encontrado');
    }
  } catch (error) {
    console.log('❌ Erro ao fazer login:', error);
  }
};

// Função para limpar localStorage
export const clearLocalStorage = () => {
  console.log('🧹 Limpando localStorage...');
  localStorage.clear();
  console.log('✅ localStorage limpo');
};

// Função para testar busca de produtos
export const testGetProducts = async () => {
  console.log('🧪 Testando busca de produtos...');
  
  try {
    const produtosResponse = await fetch('/src/services/produtos.json');
    const produtos = await produtosResponse.json();
    
    const usuariosResponse = await fetch('/src/services/usuarios.json');
    const usuarios = await usuariosResponse.json();
    
    const agricultores = usuarios.filter(u => u.role === 'agricultor');
    
    const produtosComAgricultor = produtos.map(produto => {
      const agricultor = agricultores.find(u => u.id === produto.agricultorId);
      return {
        ...produto,
        id: produto.id,
        name: produto.nome,
        title: produto.nome,
        price: produto.preco,
        description: produto.descricao,
        category: produto.categoria,
        quantity: produto.quantidade,
        image: produto.imagem,
        agricultor: agricultor ? {
          id: agricultor.id,
          username: agricultor.username,
          email: agricultor.email,
          propertyName: agricultor.propertyName,
          cityName: agricultor.city,
          stateName: agricultor.state,
          phoneNumber: agricultor.phoneNumber,
          imageProfile: agricultor.profileImage
        } : null
      };
    });
    
    console.log('✅ Produtos processados:', produtosComAgricultor.length);
    console.log('📋 Primeiros 3 produtos:', produtosComAgricultor.slice(0, 3));
    
    return produtosComAgricultor;
  } catch (error) {
    console.log('❌ Erro ao buscar produtos:', error);
    return [];
  }
};

// Função para testar busca de agricultores
export const testGetAgricultores = async () => {
  console.log('🧪 Testando busca de agricultores...');
  
  try {
    const usuariosResponse = await fetch('/src/services/usuarios.json');
    const usuarios = await usuariosResponse.json();
    
    const agricultores = usuarios.filter(u => u.role === 'agricultor');
    
    console.log('✅ Agricultores encontrados:', agricultores.length);
    console.log('📋 Lista de agricultores:', agricultores.map(a => ({
      id: a.id,
      username: a.username,
      propertyName: a.propertyName,
      city: a.city,
      state: a.state
    })));
    
    return agricultores;
  } catch (error) {
    console.log('❌ Erro ao buscar agricultores:', error);
    return [];
  }
};

// Função para testar busca de usuário por ID
export const testGetUserById = async (userId) => {
  console.log('🧪 Testando busca de usuário por ID:', userId);
  
  try {
    const usuariosResponse = await fetch('/src/services/usuarios.json');
    const usuarios = await usuariosResponse.json();
    
    const user = usuarios.find(u => u.id === parseInt(userId));
    
    if (user) {
      console.log('✅ Usuário encontrado:', user);
      return user;
    } else {
      console.log('❌ Usuário não encontrado');
      return null;
    }
  } catch (error) {
    console.log('❌ Erro ao buscar usuário:', error);
    return null;
  }
};

// Adicionar funções ao objeto window para acesso global
if (typeof window !== 'undefined') {
  window.debugUtils = {
    checkLocalStorageData,
    checkJsonData,
    autoLoginTestUser,
    clearLocalStorage,
    testGetProducts,
    testGetAgricultores,
    testGetUserById
  };
  
  console.log('🔧 Funções de debug disponíveis em window.debugUtils');
  console.log('📝 Use: debugUtils.checkLocalStorageData() para verificar dados');
  console.log('🔐 Use: debugUtils.autoLoginTestUser() para fazer login automático');
  console.log('📦 Use: debugUtils.checkJsonData() para verificar dados dos JSONs');
} 