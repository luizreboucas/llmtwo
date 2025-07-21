import { SafeAreaView,  View } from "react-native";
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { useEffect, useState } from "react";
import { Button, TextInput, Text } from "react-native-paper";
import { SIZE } from "@/consts/size";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const imageUri = 'https://www.textyourlove.com/love-quotes/12017-you-make-my-life-so-beautiful-and-you.jpg';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{
            flex: 1, 
            paddingHorizontal: 0.09 * SIZE.WIDTH, 
            paddingVertical: 0.1 * SIZE.HEIGHT,
            justifyContent: 'space-between',
            backgroundColor: "#090742",
        }}>
        <View style={{ alignItems: 'center'}}>
          <Text style={{ fontSize: 0.1 * SIZE.WIDTH, fontFamily: "Righteous", fontWeight: 'bold', color: "white" }}>Cash</Text>
          <Text style={{ fontSize: 0.1 * SIZE.WIDTH, fontFamily: "Righteous", fontWeight: 'bold', color: "white" }}>Corporative</Text>
        </View>
        <View style={{gap: 0.05 * SIZE.HEIGHT}}>
          <View>
          <Text style={{ fontSize: 0.05 * SIZE.WIDTH, fontFamily: "Righteous", fontWeight: 'bold', color: "white", marginBottom: 8 }}>Usuário:</Text>
          <TextInput
            label="Digite seu login"
            value={email}
            onChangeText={text => setEmail(text)}
            style={{fontFamily: "Righteous"}}
        />
        </View>
        <View>
          <Text style={{ fontSize: 0.05 * SIZE.WIDTH, fontFamily: "Righteous", fontWeight: 'bold', color: "white", marginBottom: 8 }}>Senha:</Text>
          <TextInput
            label="Digite sua senha"
            value={email}
            onChangeText={text => setEmail(text)}
            style={{fontFamily: "Righteous"}}
        />
        </View>
        </View>
        <Button style={{borderRadius: 0, paddingVertical: 0.01 * SIZE.HEIGHT}} buttonColor="#375dfb" icon="arrow-right" mode="contained" onPress={() => router.replace('/registerScreen')}>
            <Text style={{ fontSize: 0.05 * SIZE.WIDTH, fontFamily: "Righteous", fontWeight: 'bold', color: "white", marginBottom: 8 }}>Login</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}