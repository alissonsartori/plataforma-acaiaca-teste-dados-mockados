import React, { useEffect, useState } from "react";
import "../../styles/global-styles.css";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Text,
  Button,
  Input,
  ButtonGroup,
  FormControl,
  FormLabel,
  FormErrorMessage,
  InputRightElement,
  InputGroup,
  Radio,
  RadioGroup,
  Stack,
  useToast,
  Image,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

import ImageAgricultor from "../../assets/agricultor-forms.jpg";
import IconVoice from "../../assets/icons/voice-command.png";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import usuariosData from '../../services/usuarios.json';

const AppLogin = () => {
  const toast = useToast();
  const [value, setValueReact] = useState("agricultor");
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleClick = () => setShow(!show);
  const navigation = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue: setFormValue,
  } = useForm();

  const { handleToggleRecording, recordingField } = useSpeechRecognition({
    setValue: (fieldName, value) => {
      let processedValue = value;
      if (fieldName === "email") {
        processedValue = value.toLowerCase().replace(/\s/g, "");
      }
      setFormValue(fieldName, processedValue, { shouldValidate: true });
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const userRole = localStorage.getItem("userRole");
      if (userRole === "agricultor") {
        navigation("/perfil");
        window.location.reload();
      } else if (userRole === "consumidor") {
        navigation("/home");
        window.location.reload();
      }
    }
  }, [navigation]);

  const onSubmit = async (data) => {
    const { email, password, role } = data;
    setIsLoading(true);

    if (role === "consumidor" && value === "agricultor") {
      toast({
        title: "Erro",
        description:
          "Você selecionou o perfil errado. Por favor, escolha 'Agricultor'.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    if (role === "agricultor" && value === "consumidor") {
      toast({
        title: "Erro",
        description:
          "Você selecionou o perfil errado. Por favor, escolha 'Consumidor'.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    try {
      // Buscar usuário diretamente do JSON
      const user = usuariosData.find(
        u => u.email === email && u.password === password && u.role === role
      );

      if (!user) {
        toast({
          title: "Erro",
          description: "E-mail, senha ou perfil inválidos.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      // Gerar token simples
      const token = btoa(JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
        iat: Date.now(),
        exp: Date.now() + (7 * 24 * 60 * 60 * 1000)
      }));

      // Persistir login
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userName", user.username);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("email", user.email);
      if (user.farmerStory) {
        localStorage.setItem("historia", user.farmerStory);
      }

      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (role === "agricultor") {
        navigation("/perfil");
        setTimeout(() => window.location.reload(), 100);
      }
      if (role === "consumidor") {
        navigation("/home");
        setTimeout(() => window.location.reload(), 100);
      }
    } catch (error) {
      console.error("Erro no login:", error);
      toast({
        title: "Erro",
        description: "Erro ao realizar login. Tente novamente.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Box
        id="appforms"
        as="section"
        role="region"
        aria-label="Formulário de contato"
        backgroundImage={`url(${ImageAgricultor})`}
        backgroundRepeat="no-repeat"
        backgroundSize="cover"
        objectFit="cover"
        backgroundPosition="center"
        width="100vw"
        height="100vh"
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          padding={{ base: "2rem", md: "0 20rem" }}
          width={"100%"}
          height={"100%"}
          background="rgba(0, 0, 0, 0.6)"
          backdropFilter="blur(8px)"
          color={"white"}
          paddingTop="6rem !important"
        >
          {/* Botão de debug para desenvolvimento */}
          {import.meta.env.DEV && (
            <Button
              position="absolute"
              top="2rem"
              right="2rem"
              size="sm"
              colorScheme="red"
              onClick={() => {
                localStorage.clear();
                toast({
                  title: "Dados reinicializados!",
                  description: "Tente fazer login novamente.",
                  status: "success",
                  duration: 3000,
                });
              }}
            >
              🔄 Reinicializar Dados
            </Button>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            role="form"
            aria-label="Formulário de login"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "2rem",
              width: "100%",
              height: "100%",
            }}
          >
            <Text as={"h1"} fontSize="2rem" color={"#ffffff"}>
              Login
            </Text>
            <FormControl isInvalid={errors.email}>
              <FormLabel htmlFor="email">Email</FormLabel>
              <InputGroup>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  _placeholder={{ color: "#b0b0b0" }}
                  border={"2px solid  #83a11d"}
                  aria-required="true"
                  autoComplete="email"
                  width={"100%"}
                  height={"4rem"}
                  _focus={{
                    borderColor: "#c0ab8e",
                    boxShadow: "0 0 0 1px #e5d1b0",
                  }}
                  {...register("email", {
                    required: "Email obrigatório",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Email inválido",
                    },
                  })}
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value
                      .replace(/\s/g, "")
                      .toLowerCase();
                  }}
                />
                <InputRightElement
                  h={"100%"}
                  width={"4.5rem"}
                  alignItems="center"
                >
                  <Button
                    variant="ghost"
                    _hover={{ background: "transparent" }}
                    onClick={() =>
                      handleToggleRecording("email", {
                        trim: true,
                        toLowerCase: true,
                      })
                    }
                    isLoading={recordingField === "email"}
                    aria-label="Gravar e-mail"
                  >
                    <Image
                      src={IconVoice}
                      alt="Ícone de comando de voz"
                      width={"1.5rem"}
                      height={"1.5rem"}
                    />
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>
                {errors.email && errors.email.message}
              </FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={errors.password}>
              <FormLabel htmlFor="password">Senha</FormLabel>
              <InputGroup>
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  placeholder="Digite sua senha"
                  _placeholder={{ color: "#b0b0b0" }}
                  border={"2px solid  #83a11d"}
                  aria-required="true"
                  autoComplete="email"
                  width={"100%"}
                  height={"4rem"}
                  _focus={{
                    borderColor: "#c0ab8e",
                    boxShadow: "0 0 0 1px #e5d1b0",
                  }}
                  {...register("password", {
                    required: "Senha obrigatória",
                    minLength: {
                      value: 6,
                      message: "A senha deve ter pelo menos 6 caracteres",
                    },
                  })}
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(
                      /\s/g,
                      ""
                    );
                  }}
                />
                <InputRightElement
                  h={"100%"}
                  width={"6.5rem"}
                  display="flex"
                  alignItems="center"
                >
                  <Button
                    variant="ghost"
                    _hover={{ background: "transparent" }}
                    onClick={handleClick}
                    aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {show ? (
                      <ViewOffIcon color={"#83a11d"} />
                    ) : (
                      <ViewIcon color={"#83a11d"} />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    _hover={{ background: "transparent" }}
                    onClick={() =>
                      handleToggleRecording("password", { trim: true })
                    }
                    isLoading={recordingField === "password"}
                    aria-label="Gravar senha"
                  >
                    <Image
                      src={IconVoice}
                      alt="Ícone de comando de voz"
                      width={"1.5rem"}
                      height={"1.5rem"}
                    />
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>
                {errors.password && errors.password.message}
              </FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={errors.role}>
              <FormLabel htmlFor="role">Tipo de usuário</FormLabel>
              <Controller
                name="role"
                control={control}
                rules={{ required: "Selecione o tipo de usuário" }}
                defaultValue={value}
                render={({ field }) => (
                  <RadioGroup
                    {...field}
                    onChange={(val) => {
                      field.onChange(val);
                      setValueReact(val);
                    }}
                    value={field.value}
                  >
                    <Stack
                      direction="row"
                      spacing={5}
                      width={"100%"}
                      display={"flex"}
                      justifyContent={"space-around"}
                    >
                      <Radio
                        value="agricultor"
                        _checked={{
                          bg: "#83a11d",
                          borderColor: "#83a11d",
                          color: "white",
                        }}
                      >
                        <Text fontSize={{ base: "1rem", md: "1.2rem" }}>
                          Agricultor
                        </Text>
                      </Radio>
                      <Radio
                        fontSize={{ base: "1rem", md: "1.2rem" }}
                        value="consumidor"
                        _checked={{
                          bg: "#83a11d",
                          borderColor: "#83a11d",
                          color: "white",
                        }}
                      >
                        <Text fontSize={{ base: "1rem", md: "1.2rem" }}>
                          Consumidor
                        </Text>
                      </Radio>
                    </Stack>
                  </RadioGroup>
                )}
              />
              <FormErrorMessage>
                {errors.role && errors.role.message}
              </FormErrorMessage>
            </FormControl>
            <ButtonGroup w={"100%"} gap="1rem" alignItems={"center"}>
              <Button
                background={"transparent"}
                color={"#ffffff"}
                _hover={{ color: "#c0ab8e" }}
                fontSize="1rem"
                width={{ base: "100%", md: "30%" }}
                onClick={() => navigation("/esqueci-senha")}
                aria-label="Esqueci minha senha"
              >
                Esqueceu a senha?
              </Button>
              <Button
                type="submit"
                w={"100%"}
                color="#ffffff"
                background="#52601A"
                borderRadius="10px"
                fontFamily="Onest"
                padding="1.5rem"
                _hover={{
                  background: "#c0ab8e",
                  color: "#ffffff",
                }}
                aria-label="Fazer login"
                isLoading={isLoading}
                loadingText="Fazendo login..."
                spinnerPlacement="end"
              >
                Entrar
              </Button>
            </ButtonGroup>
          </form>
        </Box>
      </Box>
    </>
  );
};

export default AppLogin;
