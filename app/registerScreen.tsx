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
        <SafeAreaView style={{ flex: 1, backgroundColor: "#090742" }}>
            {!openCamera && ( <View style={{ alignItems: 'center', marginTop: 0.1 * SIZE.HEIGHT}}>
                <Text style={{ fontSize: 0.1 * SIZE.WIDTH, fontFamily: "Righteous", fontWeight: 'bold', color: "white" }}>Bem-Vindo(a)</Text>
            </View>)}
            {
                openCamera 
                ? (
                    <CameraView ref={ref} style={{flex: 1}} facing={"back"}>
                        <Button style={{borderRadius: 0, paddingVertical: 0.01 * SIZE.HEIGHT, position: 'absolute', bottom: 0.1 * SIZE.HEIGHT, alignSelf: 'center'}} buttonColor="#375dfb" icon="camera" mode="contained" onPress={() => takePicture()}>
                            <Text style={{ fontSize: 0.05 * SIZE.WIDTH, fontFamily: "Righteous", fontWeight: 'bold', color: "white", marginBottom: 8 }}>Registrar despesa</Text>
                        </Button>
                    </CameraView>
                )
                : (
                    <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                        <Button style={{borderRadius: 0, paddingVertical: 0.01 * SIZE.HEIGHT}} buttonColor="#375dfb" icon="plus" mode="contained" onPress={() => setOpenCamera(true)}>
                            <Text style={{ fontSize: 0.05 * SIZE.WIDTH, fontFamily: "Righteous", fontWeight: 'bold', color: "white", marginBottom: 8 }}>Informar despesa</Text>
                        </Button>
                    </View>
                )
            }
        </SafeAreaView> 
    )
}
