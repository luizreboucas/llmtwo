import { useGlobalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView, View } from "react-native";
import {Button, Text, TextInput} from "react-native-paper";
import TextRecognition from "@react-native-ml-kit/text-recognition"
import axios from "axios";
import { SIZE } from "@/consts/size";
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Picker } from "@react-native-picker/picker"
import * as FileSystem from "expo-file-system"
import {OPENAI_API_KEY, CREDENCIAIS_SAP, API_URL} from "@/env.json";
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
    const categoriasValores = categorias.map(c => c.label).join(', ');
    console.log('categorias valores:', categoriasValores);
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
    const router = useRouter();
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
        const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
        const match = content.match(jsonRegex);
        if (match) {
            try {
                return JSON.parse(match[1]);
            } catch (err) {
                console.error("Erro ao fazer o parse do JSON:", err);
            }
        }
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
                        "content": "estou enviando um texto para você analisar, preciso que você, dessa análise me retorne um JSON com as seguintes propriedades : horaDespesa, dataDespesa, valor e categoria, caso não consiga identificar alguma dessas propriedades, no valor delas coloque um null, por favor retorne apenas o JSON, eu vou pegar esse json e atribuir às minhas variáveis, traga a categoria segundo o seu valor, não sua label, elas são essas: " + categoriasValores + " o texto é :" + textedImage}
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${OPENAI_API_KEY}`
                }
            }
        )
            console.log("resposta da API:", response.data.choices[0].message.content);
            const jsonResult = extractJson(response.data.choices[0].message.content)
            const categoriaSelecionada = categorias.find(c => c.label === jsonResult.categoria);
            console.log('categoria selecionada:', categoriaSelecionada);
            setFormData(prev => ({
                ...prev,
                dataDespesa: jsonResult.dataDespesa ? String(jsonResult.dataDespesa) : "",
                horaDespesa: jsonResult.horaDespesa ? String(jsonResult.horaDespesa) : "",
                valor: jsonResult.valor ? String(jsonResult.valor) : "",
                categoria: categoriaSelecionada?.value ?? "05",
                }));
        } catch (error) {
            console.error("Erro ao chamar a API:", error);
        }
    }
    const proceedToSap = async() => {
        
        try {
            const parsedImage = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64
        })
            const data = {
                ...formData,
                imagem64: parsedImage
            }
            const request = {
                usuario: "USER123",
                matricula: "9980000000",
                data_envio: `${new Date().toISOString().split('T')[0]}T00:00:00`,
                data_despesa: `${new Date(formData.dataDespesa).toISOString().split('T')[0]}T00:00:00`,
                hora_envio: `PT${new Date().getHours()}H${new Date().getMinutes()}M0S`,
                hora_despesa: `PT${formData.horaDespesa.split(':')[0]}H${formData.horaDespesa.split(':')[1]}M00S`,
                id_categoria: `00${formData.categoria}`,
                valor: `${formData.valor}`,
                imagem_base64: "4fhwefbhufbuebf",
                status: "A1"
            }
            console.log("Dados a serem enviados para o SAP:", request);
            const response = await axios.post(API_URL,request)
            console.log("Resposta da API SAP:", response.data);
            console.log("Dados a serem enviados:", data);
            router.replace('/finishScreen');
        } catch (error) {
            console.error("Erro ao enviar dadso:", JSON.stringify(error, null, 2));
            console.log("Erro ao enviar dados:", error);
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
        <SafeAreaView style={{ flex: 1, backgroundColor: "#090742"}}>
            <Text style={{ fontSize: 0.07 * SIZE.WIDTH, alignSelf: "center", marginTop: 0.1 * SIZE.HEIGHT, fontFamily: "Righteous", fontWeight: 'bold', color: "white" }}>Dados da despesa</Text>
            <View style={{flex: 1, padding: 0.05 * SIZE.HEIGHT, paddingVertical: 0.1 * SIZE.HEIGHT, justifyContent: "space-between"}}>
            <View>
                <Text style={{ fontSize: 0.05 * SIZE.WIDTH, fontFamily: "Righteous", fontWeight: 'bold', color: "white", marginBottom: 8}}>Categoria:</Text>
                <Picker
                    selectedValue={formData.categoria}
                    itemStyle={{ color: '#375dfb', fontFamily: 'Righteous' }} 
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                    style={{ height: 0.1 * SIZE.HEIGHT, width: '100%'}}
                >
                    {categorias.map((categoria) => (
                        <Picker.Item
                            style={{fontFamily: 'Righteous'}}
                            fontFamily="Righteous"
                            key={categoria.value}
                            label={categoria.label}
                            value={categoria.value}
                        />
                    ))}
                </Picker>
            </View>
            <View>
                <Text style={{ fontSize: 0.05 * SIZE.WIDTH, fontFamily: "Righteous", fontWeight: 'bold', color: "white", marginBottom: 8}}>Data:</Text>
                <TextInput
                    mode="flat" 
                    theme={{ roundness: 0 }}
                    style={{backgroundColor: 'white'}}   
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
            </View>
            <View>
                <Text style={{ fontSize: 0.05 * SIZE.WIDTH, fontFamily: "Righteous", fontWeight: 'bold', color: "white", marginBottom: 8}}>Hora:</Text>
                <TextInput
                    mode="flat"
                    theme={{ roundness: 0 }}
                    style={{backgroundColor: 'white'}}      
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
            </View>
            <View>
                 <Text style={{ fontSize: 0.05 * SIZE.WIDTH, fontFamily: "Righteous", fontWeight: 'bold', color: "white", marginBottom: 8}}>Valor:</Text>
                <TextInput
                    mode="flat"
                    theme={{ roundness: 0 }}
                    style={{backgroundColor: 'white'}}     
                    label="Valor"
                    value={formData.valor}
                    onChangeText={(text) => setFormData({ ...formData, valor: text })}
                />
            </View>
            <Button style={{borderRadius: 0, paddingVertical: 0.01 * SIZE.HEIGHT}} buttonColor="#375dfb" icon={'send'} mode="contained">
                <Text style={{ fontSize: 0.05 * SIZE.WIDTH, fontFamily: "Righteous", fontWeight: 'bold', color: "white", marginBottom: 8 }} 
                    onPress={proceedToSap}>Enviar</Text>
            </Button>
            </View>
        </SafeAreaView>
    )
}