import { useGlobalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView, View } from "react-native";
import {Text, TextInput} from "react-native-paper";
import TextRecognition from "@react-native-ml-kit/text-recognition"
import axios from "axios";
import { SIZE } from "@/consts/size";

export default function FormScreen(){

    const Id = "0000000001";
    const Usuario = "USER123";
    const Status = "A1";
    const [imageText, setImageText] = useState("");
    const [formData, setFormData] = useState({
        Id,
        Usuario,
        Status,
        dataDespesa: "",
        horaDespesa: "",
        valor: "",
        imagem64: ""
    });
    const { uri } = useGlobalSearchParams();
    const transformImageInText = async (imageUri: string) => {
        try {
            const processed = await TextRecognition.recognize(imageUri);
            console.log('Texto reconhecido:', processed.text);
            return processed.text;
        } catch (error) {
            console.error('Erro ao reconhecer texto:', error);
            return '';
        }
    }

    const extractJson = (content: string) => {
        // Procura por um bloco JSON delimitado por ```json ... ```
        const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
        const match = content.match(jsonRegex);
        if (match) {
            try {
                return JSON.parse(match[1]);
            } catch (err) {
                console.error("Erro ao fazer o parse do JSON:", err);
            }
        }
        // Se não encontrar bloco markdown, tenta fazer o parse direto
        try {
            console.log("Tentando fazer o parse direto do JSON:", content);
            return JSON.parse(content);
        } catch (err) {
            console.error("Erro ao fazer o parse do JSON direto:", err);
            return null;
        }
    };

    const getResponseFromAi = async (textedImage: string) => {
        try {
            const response = await axios.post("https://api.openai.com/v1/chat/completions", {
                "model": "gpt-4o-mini",
                "store": false,
                "messages": [
                {
                        "role": "user", 
                        "content": "estou enviando um texto para você analisar, preciso que você, dessa análise me retorne um JSON com as seguintes propriedades : horaDespesa, dataDespesa e valor, caso não consiga identificar alguma dessas propriedades, no valor delas coloque um valor null, por favor retorne apenas o JSON, eu vou pegar esse json e atribuir às minhas variáveis, o texto é :" + textedImage}
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer token`
                }
            }
        )
            console.log("resposta da API:", response.data.choices[0].message.content);
            setFormData({...formData, ...extractJson(response.data.choices[0].message.content) });
        } catch (error) {
            console.error("Erro ao chamar a API:", error);
        }
    }

    useEffect(() => {
        const processImage = async () => {
            const textedImage = await transformImageInText(uri as string);
            await getResponseFromAi(textedImage);
            console.log("uri chegando na página de form:", uri);
            console.log("Texto extraído da imagem:", textedImage);
        };
        processImage();
    },[]);

    return (
        <SafeAreaView style={{ flex: 1}}>
            <View style={{flex: 1, padding: 0.05 * SIZE.HEIGHT, paddingVertical: 300, justifyContent: "space-between"}}>
                <Text>Dados da despesa</Text>
            <TextInput    
                label="Data da despesa"
                value={formData.dataDespesa}
                onChangeText={(text) => setFormData({ ...formData, dataDespesa: text })} 
            />
            <TextInput    
                label="Hora da despesa"
                value={formData.horaDespesa}
                onChangeText={(text) => setFormData({ ...formData, horaDespesa: text })}    
            />
            <TextInput    
                label="Valor"
                value={formData.valor}
                onChangeText={(text) => setFormData({ ...formData, valor: text })}
            />
            </View>
        </SafeAreaView>
    )
}