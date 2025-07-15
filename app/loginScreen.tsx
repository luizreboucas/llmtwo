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
//   const recognizeText = async () => {
//     console.log('início da função recognizeText');
//     try {
//       const processed = await TextRecognition.recognize(imageUri);
//       console.log('Após chamada de TextRecognition.recognize');
//       console.log('Recognized text:', processed.text);
//       console.log('processed:', processed);

//       for (let block of processed.blocks) {
//         console.log('Block text:', block.text);
//         console.log('Block frame:', block.frame);
//         for (let line of block.lines) {
//           console.log('Line text:', line.text);
//           console.log('Line frame:', line.frame);
//         }
//       }
//     } catch (error) {
//       console.error('Error recognizing text:', error);
//     }
//   };

//   useEffect(() => {
//     console.log('useEffect disparado');
//     (async () => recognizeText())();
//   }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{
            flex: 1, 
            paddingHorizontal: 0.05 * SIZE.WIDTH, 
            paddingVertical: 0.2 * SIZE.HEIGHT,
            justifyContent: 'space-between'
        }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Bem vindo</Text>
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
        <Button icon="arrow-right" mode="contained" onPress={() => router.replace('/registerScreen')}>
            Login
        </Button>
      </View>
    </SafeAreaView>
  );
}