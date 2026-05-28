import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import Button from '@/components/ui/Button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { HorizontalMenu } from '@/components/ui/HorizontalMenu';
import { useState } from 'react';

import { RPH, RPW, phoneDevice } from '@/utils/dimensions'
import { appStyle } from '@/styles/appStyle';

export default function Tab1Page() {
  const [modalVisible, setModalVisible] = useState(false)
  const sectionsArray = [
    { sectionName: "Accueil", link: "/" },
    { sectionName: "Tab 1 Test", link: "/tab1" },
    { sectionName: "Test 2", link: "/tab1" },
    { sectionName: "Se connecter / S'inscrire", link: "/login", func: () => console.log("FUNC !") },
    { sectionName: "Tab 1", link: "/tab1" },
    { sectionName: "Tab 2", link: "/tab2" },
  ]
 
  const [selectedSection, setSelectedSection] = useState("Accueil")
  
  return (
    <>
      <HorizontalMenu data={sectionsArray} titleKey={"sectionName"} chosenItem={selectedSection} setChosenItem={setSelectedSection} />
      <View style={styles.body}>
        <Text style={styles.pageTitle}>Tab 1 !</Text>

        <Button func={() => setModalVisible(!modalVisible)} text={"Button 1"} style={appStyle.largeItem} border={appStyle.lightGreyBorder} color={appStyle.strongBlack} />

        <Button func={() => setModalVisible(!modalVisible)} text={"Button 2"} />

        <ConfirmationModal
          visible={modalVisible}
          closeModal={() => setModalVisible(false)}
          confirmationText="Êtes vous sûr de vouloir supprimer votre compte ?"
          confirmationBtnText="Effacer mon profil"
          cancelBtnText="Annuler"
          confirmationFunc={() => console.log("HELLO !")}
          warning={{}}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  body: {
    ...appStyle.pageBody,
    justifyContent: 'center',
  },
  pageTitle: {
    ...appStyle.pageTitle,
  },
});
