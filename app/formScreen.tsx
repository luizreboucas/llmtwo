import { useGlobalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView, View } from "react-native";
import {Button, Text, TextInput} from "react-native-paper";
import TextRecognition from "@react-native-ml-kit/text-recognition"
import axios from "axios";
import { SIZE } from "@/consts/size";
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Picker } from "@react-native-picker/picker"

export default function FormScreen(){

    const Id = "0000000001";
    const Usuario = "USER123";
    const Status = "A1";
    const [imageText, setImageText] = useState("");
    const categorias = [
        { value: "01", label: "Passagem" },
        { value: "02", label: "Hospedagem" },
        { value: "03", label: "Refeições" },
        { value: "04", label: "Táxi" },
        { value: "05", label: "Combustível" },
        { value: "06", label: "Estacionamento" },
        { value: "07", label: "Aluguel Veículo" },
        { value: "08", label: "Material Escritório" },
        { value: "09", label: "Exame Periódico" }
    ];
    const [formData, setFormData] = useState({
        Id,
        Usuario,
        Status,
        dataDespesa: "",
        horaDespesa: "",
        valor: "",
        imagem64: "",
        categoria: ""
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

    const formatDateToString = (date: Date) => {
        if (!date) return "";
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    const getResponseFromAi = async (textedImage: string) => {
        try {
            const response = await axios.post("https://api.openai.com/v1/chat/completions", {
                "model": "gpt-4o-mini",
                "store": false,
                "messages": [
                {
                        "role": "user", 
                        "content": "estou enviando um texto para você analisar, preciso que você, dessa análise me retorne um JSON com as seguintes propriedades : horaDespesa, dataDespesa, valor e categoria, caso não consiga identificar alguma dessas propriedades, no valor delas coloque um valor null, por favor retorne apenas o JSON, eu vou pegar esse json e atribuir às minhas variáveis, traga a categoria segundo o seu valor, não sua label, elas são essas: " + categorias + " o texto é :" + textedImage}
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
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
            // await getResponseFromAi(textedImage);
            console.log("uri chegando na página de form:", uri);
            console.log("Texto extraído da imagem:", textedImage);
        };
        processImage();
    },[]);

    return (
        <SafeAreaView style={{ flex: 1}}>
            <View style={{flex: 1, padding: 0.05 * SIZE.HEIGHT, paddingVertical: 0.2 * SIZE.HEIGHT, justifyContent: "space-between"}}>
            <Picker
                selectedValue={formData.categoria || ''}
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                style={{ height: 50, width: '100%' }}
            >
                {categorias.map((categoria) => (
                    <Picker.Item key={categoria.value} label={categoria.label} value={categoria.value}
                    />
                ))}
            </Picker>
            <TextInput    
                label="Data da despesa"
                value={formData.dataDespesa}
                onPress={() => DateTimePickerAndroid.open({
                    mode: 'date',
                    value: formData.dataDespesa ? new Date(formData.dataDespesa) : new Date(),
                    onChange: (event, date) => {
                        if (date) {
                            setFormData({ ...formData, dataDespesa: formatDateToString(date) });
                        }
                    },
                })}
            />
            <TextInput    
                label="Hora da despesa"
                value={formData.horaDespesa}
                onPress={() => DateTimePickerAndroid.open({
                    mode: 'time',
                    value: formData.horaDespesa ? new Date(formData.horaDespesa) : new Date(),
                    onChange: (event, date) => {
                        if (date) {
                            setFormData({ ...formData, horaDespesa: `${date.getHours()}:${date.getMinutes()}` });
                        }
                    },
                })}
            />
            <TextInput    
                label="Valor"
                value={formData.valor}
                onChangeText={(text) => setFormData({ ...formData, valor: text })}
            />
            <Button buttonColor="#183665" icon={'send'} mode="contained">Enviar</Button>
            </View>
        </SafeAreaView>
    )
}