import React, { useState } from "react";
import {
  Box,
  Image,
  Heading,
  Text,
  Badge,
  Button,
  Flex,
  Divider,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ item, isOwner, onDelete }) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleManageProduct = () => {
    const productData = {
      id: item.id,
      name: item.name,
      category: item.category,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
    };
    navigate(`/cadastro/produto`, { state: { product: productData } });
  };

  const handleDeleteProduct = async () => {
    setIsDeleting(true);
    
    // Simular deleção (em uma aplicação real, isso seria uma chamada para a API)
    setTimeout(() => {
      if (onDelete) {
        onDelete(item.id);
      }
      setIsDeleting(false);
    }, 1000);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      boxShadow="md"
      _hover={{ boxShadow: "lg" }}
      transition="all 0.3s ease"
    >
      <Image
        src={item.image || "/src/assets/IAcai-frutas.png"}
        alt={item.name}
        width="100%"
        height="200px"
        objectFit="cover"
        onError={(e) => {
          e.target.src = "/src/assets/IAcai-frutas.png";
        }}
      />
      <Box p={4}>
        <Heading size="md" mb={2} noOfLines={2}>
          {item.name}
        </Heading>
        <Text color="green.600" fontSize="lg" fontWeight="bold" mb={2}>
          {formatPrice(item.price)}
        </Text>
        <Text fontSize="sm" color="gray.600" mb={3} noOfLines={2}>
          {item.description}
        </Text>
        <Flex gap={2} mb={3}>
          <Badge colorScheme="green" variant="subtle">
            {item.category}
          </Badge>
          <Badge colorScheme="blue" variant="subtle">
            Qtd: {item.quantity}
          </Badge>
        </Flex>
        <Divider mb={3} />
        {isOwner ? (
          <Flex gap={2}>
            <Button
              size="sm"
              colorScheme="blue"
              flex={1}
              onClick={handleManageProduct}
            >
              Editar
            </Button>
            <Button
              size="sm"
              colorScheme="red"
              flex={1}
              onClick={handleDeleteProduct}
              isLoading={isDeleting}
              loadingText="Deletando..."
            >
              Deletar
            </Button>
          </Flex>
        ) : (
          <Button
            colorScheme="green"
            width="100%"
            onClick={() => navigate(`/produto/${item.id}`)}
          >
            Ver Produto
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ProductCard;
