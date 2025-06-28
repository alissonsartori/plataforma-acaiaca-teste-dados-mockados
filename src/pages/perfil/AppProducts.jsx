import { useEffect, useState } from "react";
import AppCarrossel from "../../components/carrossel/AppCarrossel";
import ProductCard from "../../components/carrossel/ProductCard";
import AppLoading from "../../components/loading/AppLoading";
import { Box, Center, Heading, Button, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import produtosData from '../../services/produtos.json';

export default function AppProducts({ isOwner, viewedUserId }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function handleGetProducts() {
      const token = localStorage.getItem("token");
      const loggedInUserId = localStorage.getItem("userId");

      const userId = isOwner ? loggedInUserId : viewedUserId;

      if (!token || !userId) {
        setError(
          isOwner
            ? "Token de autenticação ou userId ausente."
            : "ID do usuário do perfil ausente."
        );
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        // Buscar produtos diretamente do JSON
        const userProducts = produtosData.filter(p => p.agricultorId === parseInt(userId));
        
        const formattedProducts = userProducts.map((product) => ({
          id: product.id,
          name: product.nome,
          description: product.descricao,
          price: product.preco,
          image: product.imagem,
          category: product.categoria,
          quantity: product.quantidade,
        }));

        setProducts(formattedProducts);
        console.log('✅ Produtos do usuário carregados:', formattedProducts.length);
        
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
        setError(
          err.message ||
            "Erro ao buscar produtos. Verifique sua conexão ou tente novamente."
        );
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }

    handleGetProducts();
  }, [isOwner, viewedUserId]);

  if (isLoading) return <AppLoading />;

  return (
    <Center w="100%" h="100%" flexDirection="column" gap={4}>
      {error && (
        <Text color="red.500" fontWeight="bold" mt={4}>
          {error}
        </Text>
      )}
      {isOwner && (
        <>
          <Heading size="lg">Meus Produtos</Heading>
          <Button
            onClick={() => navigate("/cadastro/produto")}
            color="white"
            bg="#52601A"
            width="80%"
            maxW="400px"
            _hover={{ bg: "#773F0F" }}
          >
            Cadastrar Novo Produto
          </Button>
        </>
      )}

      <Box width="100%" height="100%" maxW="550px" mx="auto" overflowX="hidden">
        <AppCarrossel
          data={products}
          title={
            !isOwner
              ? `Produtos de ${
                  localStorage.getItem("currentProfileUsername") ||
                  "este usuário"
                }`
              : ""
          }
          renderItem={(item) => (
            <ProductCard
              item={item}
              isOwner={isOwner}
              onDelete={(deletedId) => {
                setProducts((prevProducts) =>
                  prevProducts.filter((product) => product.id !== deletedId)
                );
              }}
            />
          )}
          itemsDesktop={1}
        />
      </Box>
    </Center>
  );
}
