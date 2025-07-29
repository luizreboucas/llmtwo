import { useGlobalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView, View, BackHandler, Image } from "react-native";
import {Button, IconButton, Text, TextInput} from "react-native-paper";
import TextRecognition from "@react-native-ml-kit/text-recognition"
import axios from "axios";
import { SIZE } from "@/consts/size";
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Picker } from "@react-native-picker/picker"
import * as FileSystem from "expo-file-system"
import {OPENAI_API_KEY, CREDENCIAIS_SAP, API_URL} from "@/env.json";
import { FlipType, SaveFormat, useImageManipulator } from 'expo-image-manipulator';
export default function FormScreen(){

    const Id = "0000000001";
    const Usuario = "USER123";
    const Status = "A1";
    const [imageText, setImageText] = useState("");
    const [loading, setLoading] = useState(false);
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
        dataDespesa: new Date(),
        horaDespesa: "00:00",
        valor: "",
        imagem64: "",
        categoria: ""
    });
    const { uri } = useGlobalSearchParams();
    const imageContext = useImageManipulator(uri as string);
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
        setLoading(true);
        try {
            const response = await axios.post("https://api.openai.com/v1/chat/completions", {
                "model": "gpt-4o-mini",
                "store": false,
                "messages": [
                {
                        "role": "user", 
                        "content": "estou enviando um texto para você analisar, preciso que você, dessa análise me retorne um JSON com as seguintes propriedades : horaDespesa, dataDespesa, valor e categoria, caso não consiga identificar alguma dessas propriedades, no valor delas coloque um null, dataDespesa traga com o valor no tipo YYYY-MM-DD, horaDespesa como HH:SS, por favor retorne apenas o JSON, eu vou pegar esse json e atribuir às minhas variáveis, traga a categoria segundo o seu valor, não sua label, elas são essas: " + categoriasValores + " o texto é :" + textedImage}
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${OPENAI_API_KEY}`
                }
            }
        )
            setLoading(false);
            console.log("resposta da API:", response.data.choices[0].message.content);
            const jsonResult = extractJson(response.data.choices[0].message.content)
            const categoriaSelecionada = categorias.find(c => c.label === jsonResult.categoria);
            console.log('categoria selecionada:', categoriaSelecionada);
            setFormData(prev => ({
                ...prev,
                 dataDespesa: jsonResult.dataDespesa
                ? (() => {
                    const [year, month, day] = String(jsonResult.dataDespesa).split('-').map(Number);
                    return new Date(year, month - 1, day);
                })()
                : prev.dataDespesa,
                horaDespesa: jsonResult.horaDespesa ? String(jsonResult.horaDespesa): "",
                valor: jsonResult.valor ? String(jsonResult.valor) : prev.valor,
                categoria: categoriaSelecionada?.value ?? "05",
            }));
        } catch (error) {
            console.error("Erro ao chamar a API:", error);
            setLoading(false);
        }
         setLoading(false);
    }
    const proceedToSap = async() => {
        setLoading(true);
        try {
            const image = await imageContext.renderAsync()
            const compressedImage = await image.saveAsync({
                base64: true,
                format: SaveFormat.JPEG,
                compress: 0.1
            })
            const parsedImage = await FileSystem.readAsStringAsync(compressedImage.uri, {
            encoding: FileSystem.EncodingType.Base64,

        }) 
            const request = {
                usuario: "USER123",
                matricula: "9980000000",
                data_envio: `${new Date().toISOString().split('T')[0]}T00:00:00`,
                data_despesa: `${formData.dataDespesa.toISOString().split('T')[0]}T00:00:00`,
                hora_envio: `PT${new Date().getHours()}H${new Date().getMinutes()}M0S`,
                hora_despesa: `PT${formData.horaDespesa.substring(0,2)}H${formData.horaDespesa.substring(3)}M00S`,
                id_categoria: `00${formData.categoria}`,
                valor: `${formData.valor}`,
                imagem_base64: parsedImage,
                status: "A1"
            }
            const response = await axios.post(API_URL,request)
            console.log("Resposta da API SAP:", response.data);
            setLoading(false);
            router.replace('/finishScreen');
        } catch (error) {
            console.error("Erro ao enviar dadso:", JSON.stringify(error, null, 2));
            console.log("Erro ao enviar dados:", error);
            setLoading(false);
        }
        setLoading(false);
    }
    function getTodayWithTime(hora: string) {
        const [h, m] = hora.split(':').map(Number);
        const d = new Date();
        d.setHours(h || 0, m || 0, 0, 0);
    return d;
}
    useEffect(() => {
        const processImage = async () => {
            const textedImage = await transformImageInText(uri as string);
            await getResponseFromAi(textedImage);
            console.log("uri chegando na página de form:", uri);
            console.log("Texto extraído da imagem:", textedImage);
        };
        processImage();

        const backHandler = () => {
            router.back();
            return true;
        };
        const subscription = BackHandler.addEventListener('hardwareBackPress', backHandler);
        return () => subscription.remove();
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
                    value={formatDateToString(formData.dataDespesa)}
                    onPress={() => DateTimePickerAndroid.open({
                        mode: 'date',
                        value: formData.dataDespesa ? new Date(formData.dataDespesa) : new Date(),
                        onChange: (event, date) => {
                            if (date) {
                                setFormData({ ...formData, dataDespesa: date });
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
                        value: getTodayWithTime(formData.horaDespesa),
                        onChange: (event, date) => {
                            if (date) {
                                setFormData({ ...formData, horaDespesa: (date.getHours().toString().padStart(2, '0')) + ':' + date.getMinutes().toString().padStart(2, '0') });
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
            <Button loading={loading} style={{borderRadius: 0, paddingVertical: 0.01 * SIZE.HEIGHT}} buttonColor="#375dfb" icon={'send'} mode="contained">
                <Text style={{ fontSize: 0.05 * SIZE.WIDTH, fontFamily: "Righteous", fontWeight: 'bold', color: "white", marginBottom: 8 }} 
                    onPress={proceedToSap}>Enviar</Text>
            </Button>
            </View>
        </SafeAreaView>
    )
}