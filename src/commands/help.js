const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show how to use the bot (แสดงคู่มือวิธีการใช้งานบอท)'),
    
  async execute(interaction) {
    try {
      const helpEmbed = new EmbedBuilder()
        .setColor(0xFF99CC)
        .setTitle('🎀 คู่มือเวทมนตร์แห่งความทรงจำของเมม (Mem) 🎀')
        .setDescription('มิว! สวัสดีผู้บุกเบิก~ เมม Memosprite ตัวน้อยมาช่วยดูแลและบันทึกความทรงจำการเติมเกมของคุณแล้วนะมิว! ✨ ไม่ต้องห่วงเลย เมมจะเก็บรักษายอดเปย์—เอ้ย! ความทรงจำเหล่านี้ไว้อย่างดีที่สุดใน Amphoreus เลย~\n\nนี่คือคำสั่งเวทมนตร์ทั้งหมดที่เมมเตรียมไว้ให้ใช้งานนะมิว:')
        .addFields(
          { 
            name: '📝 `/topup <game>` (บันทึกความทรงจำใหม่)', 
            value: 'ใช้สำหรับให้เมมบันทึกยอดการเติมเงินครั้งใหม่ของคุณนะมิว!\n• ผู้บุกเบิกสามารถพิมพ์ชื่อเกมใหม่ หรือเลือกจากความทรงจำที่เมมแนะนำก็ได้เลย~\n• พอกด Enter เมมจะเสกฟอร์มขึ้นมาให้ รบกวนผู้บุกเบิกกรอกตัวเลขจำนวนเงินให้ครบถ้วนด้วยนะมิว ความทรงจำจะได้เป๊ะๆ และไม่ตกหล่น!' 
          },
          { 
            name: '📊 `/summary [game]` (ทบทวนความทรงจำทั้งหมด)', 
            value: 'ใช้สำหรับตรวจสอบยอดว่าผู้บุกเบิกสะสมความทรงจำ (เสียเงิน) ไปเท่าไหร่แล้วมิว!\n• ไม่ระบุชื่อเกม: เมมจะรวบรวมยอดความทรงจำทั้งหมดของ ทุกเกม มาให้ดูรวดเดียวเลย!\n• ระบุชื่อเกม: เมมจะคัดแยกและสรุปยอดให้เฉพาะเกมที่ผู้บุกเบิกกำลังเลือกนะมิว~' 
          },
          { 
            name: '❓ `/help` (เรียกหาเมม!)', 
            value: 'แสดงหน้าต่างคู่มือนี้ เพื่อดูวิธีการใช้งานนะมิว! ถ้าสับสนหรือจำเวทมนตร์ไม่ได้เมื่อไหร่ พิมพ์คำสั่งนี้เรียกหาเมมได้เลย~\n\nให้เมมช่วยดูแลความทรงจำพวกนี้นะมิว! ถ้าพร้อมแล้ว เรามาเริ่มสร้างความทรงจำไปด้วยกันเถอะ มิว~ ✨' 
          }
        )
        .setFooter({ text: 'Mem - Memosprite Top-up Tracker', iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) });

      await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
    } catch (error) {
      console.error('Error executing help command:', error);
      // Fallback in case the interaction hasn't been replied to yet
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ เมมเกิดอาการมึนงงชั่วคราว! เรียกเมมไม่ได้ซะแล้ว (An error occurred)', ephemeral: true }).catch(console.error);
      }
    }
  }
};
