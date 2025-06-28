import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Spinner,
  Text,
  Button,
  useToast,
  VStack,
  Heading,
  Center,
} from "@chakra-ui/react";
import { MdArrowBack } from "react-icons/md";
import ProductDetailCard from "./ProductDetailCard";
import AppCarrossel from "../../components/carrossel/AppCarrossel";
import ProductCard from "../../components/carrossel/ProductCard";
import ImagemPerfil from "../../assets/plataforma-vovo.png";
import AppLoading from "../../components/loading/AppLoading";
import produtosData from "../../services/produtos.json";
import usuariosData from "../../services/usuarios.json";

const AppProdutoUnico = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [farmerProducts, setFarmerProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFarmerProducts, setLoadingFarmerProducts] = useState(false);
  const [error, setError] = useState(null);

  const fetchFarmerProducts = async (farmerId) => {
    if (!farmerId) return;

    try {
      setLoadingFarmerProducts(true);
      
      // Buscar produtos do mesmo agricultor
      const productsFromSameFarmer = produtosData
        .filter(p => p.agricultorId === farmerId && p.id !== parseInt(id))
        .map(product => ({
          id: product.id,
          name: product.nome,
          description: product.descricao,
          price: product.preco,
          image: product.imagem,
          category: product.categoria,
          quantity: product.quantidade,
        }));

      setFarmerProducts(productsFromSameFarmer);
    } catch (err) {
      console.error("Erro ao buscar produtos do agricultor:", err);
      toast({
        title: "Erro ao carregar produtos do agricultor",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingFarmerProducts(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('🔍 Buscando produto com ID:', id);
        
        // Buscar produto diretamente do JSON importado
        const foundProduct = produtosData.find(p => p.id === parseInt(id));
        
        if (foundProduct) {
          // Buscar informações do agricultor
          const agricultor = usuariosData.find(u => u.id === foundProduct.agricultorId);
          
          const productWithAgricultor = {
            ...foundProduct,
            id: foundProduct.id,
            name: foundProduct.nome,
            price: foundProduct.preco,
            description: foundProduct.descricao,
            category: foundProduct.categoria,
            quantity: foundProduct.quantidade,
            image: foundProduct.imagem,
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
          
          setProduct(productWithAgricultor);
          console.log('✅ Produto encontrado:', productWithAgricultor.name);

          // Buscar outros produtos do mesmo agricultor
          if (foundProduct.agricultorId) {
            fetchFarmerProducts(foundProduct.agricultorId);
          }
        } else {
          setError("Produto não encontrado");
          console.log('❌ Produto não encontrado');
        }
      } catch (error) {
        console.error("Erro ao buscar produto:", error);
        setError("Erro ao carregar produto: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <AppLoading />;
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Center>
          <Box textAlign="center">
            <Heading size="lg" color="red.500" mb={4}>
              Erro
            </Heading>
            <Text fontSize="lg" mb={4}>
              {error}
            </Text>
            <Text
              color="blue.500"
              cursor="pointer"
              onClick={() => navigate("/")}
              _hover={{ textDecoration: "underline" }}
            >
              Voltar para a página inicial
            </Text>
          </Box>
        </Center>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxW="container.xl" py={8}>
        <Center>
          <Box textAlign="center">
            <Heading size="lg" mb={4}>
              Produto não encontrado
            </Heading>
            <Text
              color="blue.500"
              cursor="pointer"
              onClick={() => navigate("/")}
              _hover={{ textDecoration: "underline" }}
            >
              Voltar para a página inicial
            </Text>
          </Box>
        </Center>
      </Container>
    );
  }

  return (
    <Box background={"#f7f7f7"}>
      <Box
        h={{ base: "180px", md: "60vh" }}
        bgImage={`url(${ImagemPerfil})`}
        bgSize="cover"
        bgPosition="center"
        position="relative"
        mb={8}
      >
        <Box position="absolute" inset="0" bg="rgba(0, 0, 0, 0.5)" />

        <Container maxW="container.xl" position="relative" zIndex={2} h="full">
          <Box
            position="absolute"
            top={"14rem"}
            left="50%"
            transform="translateX(-50%)"
            w="full"
            maxW="container.lg"
          >
            <ProductDetailCard product={product} />
          </Box>
        </Container>
      </Box>

      <Container maxW="container.xl" mt="32rem" mb={8}>
        {farmerProducts.length > 0 && (
          <Box mt={16} mb={8}>
            <AppCarrossel
              data={farmerProducts}
              title="Outros produtos deste agricultor"
              renderItem={(item) => (
                <ProductCard item={item} isOwner={false} />
              )}
              itemsDesktop={3}
              itemsTablet={2}
              itemsMobile={1}
            />
          </Box>
        )}
        {loadingFarmerProducts && (
          <Box mt={8} textAlign="center">
            <Spinner size="md" color="green.500" />
            <Text mt={2}>Carregando outros produtos...</Text>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default AppProdutoUnico;
