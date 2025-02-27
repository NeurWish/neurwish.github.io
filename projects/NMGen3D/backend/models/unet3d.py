import tensorflow as tf
from tensorflow.python.keras import layers, models

class UNet3D(tf.keras.Model):
    def __init__(self):
        super(UNet3D, self).__init__()

        # Encoder
        self.encoder = models.Sequential([
            layers.Conv3D(64, kernel_size=3, padding='same', activation='relu'),
            layers.MaxPooling3D(pool_size=2)
        ])

        # Middle
        self.middle = models.Sequential([
            layers.Conv3D(128, kernel_size=3, padding='same', activation='relu'),
            layers.MaxPooling3D(pool_size=2)
        ])

        # Decoder
        self.decoder = models.Sequential([
            layers.Conv3D(64, kernel_size=3, padding='same', activation='relu'),
            layers.Conv3DTranspose(1, kernel_size=2, strides=2, padding='same')
        ])

    def call(self, inputs):
        x1 = self.encoder(inputs)
        x2 = self.middle(x1)
        x3 = self.decoder(x2)
        return x3
