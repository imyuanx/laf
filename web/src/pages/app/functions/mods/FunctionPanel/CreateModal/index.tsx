import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormErrorMessage,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { t } from "i18next";
import { debounce } from "lodash";

import { TextIcon } from "@/components/CommonIcon";
import InputTag from "@/components/InputTag";
import { DEFAULT_CODE, SUPPORTED_METHODS } from "@/constants";
import { changeURL } from "@/utils/format";

import { useCreateFunctionMutation, useUpdateFunctionMutation } from "../../../service";
import useFunctionStore from "../../../store";

import { TFunctionTemplate, TMethod } from "@/apis/typing";
import FunctionTemplate from "@/pages/functionTemplate";
import TemplateCard from "@/pages/functionTemplate/Mods/TemplateCard/TemplateCard";
import { useGetRecommendFunctionTemplatesQuery } from "@/pages/functionTemplate/service";
import useGlobalStore from "@/pages/globalStore";

const CreateModal = (props: {
  functionItem?: any;
  children?: React.ReactElement;
  tagList?: any;
  aiCode?: string;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const store = useFunctionStore();
  const { showSuccess, currentApp } = useGlobalStore();

  const { functionItem, children = null, tagList, aiCode } = props;
  const isEdit = !!functionItem;
  const navigate = useNavigate();
  const [searchKey, setSearchKey] = useState("");
  const [templateOpen, setTemplateOpen] = useState(false);

  const defaultValues = {
    name: functionItem?.name || "",
    description: functionItem?.desc || "",
    websocket: !!functionItem?.websocket,
    methods: functionItem?.methods || ["GET", "POST"],
    code: functionItem?.source.code || aiCode || DEFAULT_CODE || "",
    tags: functionItem?.tags || [],
  };

  type FormData = {
    name: string;
    description: string;
    websocket: boolean;
    methods: TMethod[];
    code: string;
    tags: string[];
  };

  const {
    register,
    handleSubmit,
    control,
    setFocus,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues,
  });

  const createFunctionMutation = useCreateFunctionMutation();
  const updateFunctionMutation = useUpdateFunctionMutation();

  const TemplateList = useGetRecommendFunctionTemplatesQuery(
    {
      page: 1,
      pageSize: 6,
      keyword: searchKey,
      type: "default",
      asc: 1,
      sort: null,
    },
    {
      enabled: isOpen && !isEdit,
    },
  );

  const onSubmit = async (data: any) => {
    let res: any = {};
    if (isEdit && functionItem.name !== data.name) {
      res = await updateFunctionMutation.mutateAsync({
        ...data,
        name: functionItem.name,
        newName: data.name,
      });
    } else if (isEdit && functionItem.name === data.name) {
      res = await updateFunctionMutation.mutateAsync(data);
    } else {
      res = await createFunctionMutation.mutateAsync(data);
    }

    if (!res.error) {
      showSuccess(isEdit ? t("update success") : t("create success"));
      onClose();
      store.setCurrentFunction(res.data);
      reset(defaultValues);
      navigate(`/app/${currentApp.appid}/function/${res.data.name}`);
    }
  };

  return (
    <>
      {children &&
        React.cloneElement(children, {
          onClick: () => {
            onOpen();
            reset(defaultValues);
            setTimeout(() => {
              setFocus("name");
            }, 0);
          },
        })}

      <Modal isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEdit ? t("FunctionPanel.EditFunction") : t("FunctionPanel.AddFunction")}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack align="flex-start">
              <FormControl isInvalid={!!errors?.name}>
                <div className="mb-3 flex h-12 w-full items-center border-b-2">
                  <input
                    {...register("name", {
                      pattern: {
                        value: /^[a-zA-Z0-9_.\-/]{1,256}$/,
                        message: t("FunctionPanel.FunctionNameRule"),
                      },
                    })}
                    id="name"
                    placeholder={String(t("FunctionPanel.FunctionNameTip"))}
                    className="h-8 w-full border-l-2 border-primary-600 bg-transparent pl-4 text-2xl font-medium"
                    style={{ outline: "none", boxShadow: "none" }}
                    onChange={debounce((e) => {
                      setSearchKey(e.target.value);
                    }, 500)}
                  />
                </div>
                <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors?.methods}>
                <HStack spacing={6}>
                  <Controller
                    name="methods"
                    control={control}
                    render={({ field: { ref, ...rest } }) => (
                      <CheckboxGroup {...rest} colorScheme="primary">
                        {Object.keys(SUPPORTED_METHODS).map((item) => {
                          return (
                            <Checkbox value={item} key={item}>
                              {item}
                            </Checkbox>
                          );
                        })}
                      </CheckboxGroup>
                    )}
                  />
                </HStack>
                <FormErrorMessage>{errors.methods?.message}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <HStack className="mt-1 w-full">
                  <Controller
                    name="tags"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <InputTag value={value || []} onChange={onChange} tagList={tagList} />
                    )}
                  />
                </HStack>
              </FormControl>

              <FormControl>
                <div className="flex w-full items-center border-b-2 border-transparent focus-within:border-grayModern-200">
                  <TextIcon fontSize={16} color={"gray.300"} />
                  <input
                    id="description"
                    placeholder={t("FunctionPanel.Description").toString()}
                    className="w-full bg-transparent py-2 pl-2 text-lg text-second"
                    style={{ outline: "none", boxShadow: "none" }}
                    {...register("description")}
                  />
                </div>
              </FormControl>

              {!isEdit && !aiCode && (
                <div className="w-full">
                  {TemplateList.data?.data.list.length > 0 && (
                    <div className="pb-3 text-lg font-medium text-grayModern-700">
                      {t("Template.Recommended")}
                    </div>
                  )}
                  <div className="flex flex-wrap">
                    {TemplateList.data?.data.list.map((item: TFunctionTemplate) => (
                      <div className="mb-3 w-1/3 pr-3" key={item._id}>
                        <TemplateCard
                          template={item}
                          onClick={() => {
                            navigate(changeURL(`/${item._id}`));
                            setTemplateOpen(true);
                          }}
                          templateCategory="recommended"
                          isModal={true}
                        />
                      </div>
                    ))}
                  </div>
                  <div
                    onClick={() => {
                      navigate(changeURL(`/recommended`));
                    }}
                  >
                    <button
                      className="w-full cursor-pointer bg-primary-100 py-2 text-primary-600"
                      onClick={() => setTemplateOpen(true)}
                    >
                      {t("FunctionPanel.CreateFromTemplate")}
                    </button>
                  </div>
                </div>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => {
                onClose();
              }}
            >{t`Cancel`}</Button>
            <Button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              isLoading={updateFunctionMutation.isLoading || createFunctionMutation.isLoading}
            >
              {t`Confirm`}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={templateOpen}
        onClose={() => {
          setTemplateOpen(!templateOpen);
          navigate(changeURL("/"));
        }}
      >
        <ModalOverlay />
        <ModalContent height={"95%"} maxW={"80%"} m={"auto"} overflowY={"auto"}>
          <ModalHeader pb={-0.5}>{t("HomePage.NavBar.funcTemplate")}</ModalHeader>
          <ModalBody>
            <ModalCloseButton />
            <FunctionTemplate isModal={true} />
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreateModal;
