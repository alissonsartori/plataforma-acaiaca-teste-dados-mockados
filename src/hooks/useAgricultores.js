import { useState, useEffect } from 'react';
import agricultoresData from '../services/agricultores.json';

export const useAgricultores = () => {
  const [agricultores, setAgricultores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inicializar dados no localStorage se não existirem
  useEffect(() => {
    const storedAgricultores = localStorage.getItem('agricultores');
    
    if (!storedAgricultores) {
      // Primeira execução - carregar dados iniciais
      localStorage.setItem('agricultores', JSON.stringify(agricultoresData));
      setAgricultores(agricultoresData);
    } else {
      // Carregar dados existentes do localStorage
      setAgricultores(JSON.parse(storedAgricultores));
    }
    
    setLoading(false);
  }, []);

  // Função para adicionar novo agricultor
  const addAgricultor = (novoAgricultor) => {
    const updatedAgricultores = [...agricultores, novoAgricultor];
    setAgricultores(updatedAgricultores);
    localStorage.setItem('agricultores', JSON.stringify(updatedAgricultores));
  };

  // Função para buscar agricultor por email e senha
  const findAgricultor = (email, password, role) => {
    return agricultores.find(
      (agri) => agri.email === email && agri.password === password && agri.role === role
    );
  };

  // Função para verificar se email já existe
  const emailExists = (email) => {
    return agricultores.some(agri => agri.email === email);
  };

  // Função para gerar novo ID
  const generateNewId = () => {
    return agricultores.length ? Math.max(...agricultores.map(a => a.id)) + 1 : 1;
  };

  return {
    agricultores,
    loading,
    addAgricultor,
    findAgricultor,
    emailExists,
    generateNewId
  };
}; 