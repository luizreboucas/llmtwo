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
            paddingHorizontal: 0.05 * SIZE.WIDTH, 
            paddingVertical: 0.2 * SIZE.HEIGHT,
            justifyContent: 'space-between'
        }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: "#183665" }}>Bem vindo</Text>
        <TextInput
            label="Email"
            value={email}
            onChangeText={text => setEmail(text)}
        />
        <TextInput
            label="Senha"
            value={password}
            onChangeText={text => setPassword(text)}
            secureTextEntry
        />
        <Button buttonColor="#183665" icon="arrow-right" mode="contained" onPress={() => router.replace('/registerScreen')}>
            Login
        </Button>
      </View>
    </SafeAreaView>
  );
}