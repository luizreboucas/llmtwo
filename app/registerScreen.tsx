import { SafeAreaView, View } from "react-native";
import { Button, Text } from "react-native-paper";
import {useState, useRef} from "react";
import { CameraView, CameraType, useCameraPermissions, Camera } from "expo-camera";
import Loading from "@/components/Loading";
import { SIZE } from "@/consts/size";
import { useRouter } from "expo-router";

export default function RegisterScreen() {
    const [openCamera, setOpenCamera] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const ref = useRef<CameraView>(null);
    const [uri, setUri] = useState<string | null>(null);
    const router = useRouter();

    if (!permission) return <Loading />;

    if (!permission.granted) {
        return (
            <View style={{flex: 1, justifyContent: "center"}}>
                <Text style={{ textAlign: 'center',paddingBottom: 10}}>Precisamos da sua permissão para acessar a câmera</Text>
                <Button onPress={requestPermission}>Ceder permissão</Button>
            </View>
        );
    }

    const takePicture = async () => {
        const photo = await ref.current?.takePictureAsync();
        console.log('Foto capturada:', photo);
        setUri(photo?.uri ?? null);
        goToForm(photo?.uri);
    };

    const goToForm = (uriInput: string) => {
        if (!uriInput) {
            console.log('Nenhuma imagem capturada');
            return;
        }
        router.push({
            pathname: '/formScreen',
            params: { uri: uriInput }
        });
    }
    return(
        <SafeAreaView style={{ flex: 1}}>
            {
                openCamera 
                ? (
                    <CameraView ref={ref} style={{flex: 1}} facing={"back"}>
                            <Button buttonColor="#183665" style={{
                                marginHorizontal: 0.1 * SIZE.WIDTH,
                                position: 'absolute',
                                bottom: 0.1 * SIZE.HEIGHT,
                                alignSelf: 'center'
                            }} icon="record" mode="contained" onPress={() => takePicture()}>Registrar Despesa</Button>
                    </CameraView>
                )
                : (
                    <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                        <Button buttonColor="#183665" icon="plus" mode="contained" onPress={() => setOpenCamera(true)}>Informar Despesa</Button>
                    </View>
                )
            }
        </SafeAreaView> 
    )
}   