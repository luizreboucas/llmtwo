import { SIZE } from "@/consts/size";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { SafeAreaView } from "react-native";
import { Text } from "react-native-paper";

export default function FinishScreen() {
    const router = useRouter();
    useEffect(() => {
        setTimeout(() => {
            router.replace("/registerScreen");
        }, 5000);
    },[])
    return(
        <SafeAreaView style={{ flex: 1, backgroundColor: "#090742", justifyContent: 'center', alignItems: 'center', paddingHorizontal: 0.1 * SIZE.WIDTH }}>
            <Text 
                style={{ 
                    fontSize: 0.1 * SIZE.WIDTH, 
                    fontFamily: "Righteous", 
                    fontWeight: 'bold', 
                    color: "white"
                    }}>
                        Despesa informada com sucesso!
                    </Text>
      </SafeAreaView>
    )
}